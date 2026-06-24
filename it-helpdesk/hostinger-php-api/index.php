<?php
declare(strict_types=1);

$config = require __DIR__ . '/config.php';

$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://it-helpdesk.vercel.app',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function jsonResponse($data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode(['data' => $data], JSON_UNESCAPED_UNICODE);
    exit;
}

function jsonError(string $message, int $status = 400): void
{
    http_response_code($status);
    echo json_encode(['error' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

function db(array $config): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=%s',
        $config['host'],
        $config['database'],
        $config['charset']
    );

    $pdo = new PDO($dsn, $config['username'], $config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    return $pdo;
}

function readJsonBody(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function rowToApi(array $row): array
{
    $out = [];
    foreach ($row as $key => $value) {
        if ($key === 'id') {
            $out['id'] = (int) $value;
            continue;
        }
        if (in_array($key, ['createdAt', 'updatedAt', 'resolvedAt'], true)) {
            $out[$key] = $value === null || $value === '' ? '' : (float) $value;
            continue;
        }
        if ($key === 'resolutionHours') {
            $out[$key] = (int) $value;
            continue;
        }
        $out[$key] = $value ?? '';
    }
    return $out;
}

function fetchAll(PDO $pdo, string $table): array
{
  $stmt = $pdo->query("SELECT * FROM `$table` ORDER BY id ASC");
  return array_map('rowToApi', $stmt->fetchAll());
}

function fetchById(PDO $pdo, string $table, int $id): ?array
{
    $stmt = $pdo->prepare("SELECT * FROM `$table` WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    return $row ? rowToApi($row) : null;
}

function tableForResource(string $resource): ?string
{
    $map = [
        'tickets' => 'tickets',
        'employees' => 'employees',
        'agents' => 'agents',
        'slaRules' => 'sla_rules',
    ];
    return $map[$resource] ?? null;
}

$pdo = db($config);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '';
$path = trim(preg_replace('#^/api#', '', $path), '/');
$segments = $path === '' ? [] : explode('/', $path);
$resource = $segments[0] ?? '';
$id = isset($segments[1]) && ctype_digit($segments[1]) ? (int) $segments[1] : null;
$table = tableForResource($resource);

if (!$table) {
    jsonError('Not found', 404);
}

try {
    if ($method === 'GET' && $id === null) {
        jsonResponse(fetchAll($pdo, $table));
    }

    if ($method === 'GET' && $id !== null) {
        $row = fetchById($pdo, $table, $id);
        if (!$row) {
            jsonError('Not found', 404);
        }
        jsonResponse($row);
    }

    if ($method === 'POST' && $resource === 'tickets') {
        $body = readJsonBody();
        $required = ['ticketId', 'employeeId', 'employeeName', 'title', 'category', 'priority', 'status', 'agentId', 'agentName', 'createdAt', 'updatedAt'];
        foreach ($required as $field) {
            if (!array_key_exists($field, $body)) {
                jsonError("Missing field: $field");
            }
        }

        $stmt = $pdo->prepare(
            'INSERT INTO tickets (
                ticketId, employeeId, employeeName, title, description, category, priority, status,
                agentId, agentName, createdAt, updatedAt, resolvedAt, resolutionNote, internalNote
            ) VALUES (
                :ticketId, :employeeId, :employeeName, :title, :description, :category, :priority, :status,
                :agentId, :agentName, :createdAt, :updatedAt, :resolvedAt, :resolutionNote, :internalNote
            )'
        );

        $stmt->execute([
            ':ticketId' => $body['ticketId'],
            ':employeeId' => $body['employeeId'],
            ':employeeName' => $body['employeeName'],
            ':title' => $body['title'],
            ':description' => $body['description'] ?? '',
            ':category' => $body['category'],
            ':priority' => $body['priority'],
            ':status' => $body['status'],
            ':agentId' => $body['agentId'],
            ':agentName' => $body['agentName'],
            ':createdAt' => (float) $body['createdAt'],
            ':updatedAt' => (float) $body['updatedAt'],
            ':resolvedAt' => $body['resolvedAt'] === '' || $body['resolvedAt'] === null ? null : (float) $body['resolvedAt'],
            ':resolutionNote' => $body['resolutionNote'] ?? '',
            ':internalNote' => $body['internalNote'] ?? '',
        ]);

        $newId = (int) $pdo->lastInsertId();
        jsonResponse(fetchById($pdo, 'tickets', $newId), 201);
    }

    if ($method === 'PATCH' && $resource === 'tickets' && $id !== null) {
        $body = readJsonBody();
        if (!$body) {
            jsonError('No updates provided');
        }

        $allowed = [
            'status', 'priority', 'agentId', 'agentName', 'updatedAt', 'resolvedAt',
            'resolutionNote', 'internalNote', 'title', 'description', 'category',
        ];

        $sets = [];
        $params = [];
        foreach ($body as $key => $value) {
            if (!in_array($key, $allowed, true)) {
                continue;
            }
            $sets[] = "`$key` = :$key";
            if (in_array($key, ['createdAt', 'updatedAt', 'resolvedAt'], true)) {
                $params[":$key"] = $value === '' || $value === null ? null : (float) $value;
            } else {
                $params[":$key"] = $value;
            }
        }

        if (!$sets) {
            jsonError('No valid updates provided');
        }

        $params[':id'] = $id;
        $sql = 'UPDATE tickets SET ' . implode(', ', $sets) . ' WHERE id = :id';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        $row = fetchById($pdo, 'tickets', $id);
        if (!$row) {
            jsonError('Not found', 404);
        }
        jsonResponse($row);
    }

    jsonError('Method not allowed', 405);
} catch (Throwable $e) {
    jsonError('Server error: ' . $e->getMessage(), 500);
}
