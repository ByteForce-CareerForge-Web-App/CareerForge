<?php

/*
|--------------------------------------------------------------------------
| OPPORTUNITIES CONFIGURATION
|--------------------------------------------------------------------------
|
| Shared helper functions for opportunity-related API operations.
|
*/

require_once __DIR__ . "/database.php";


/*
|--------------------------------------------------------------------------
| Get Opportunity By ID
|--------------------------------------------------------------------------
*/

function getOpportunityById($pdo, $id)
{
    $stmt = $pdo->prepare("
        SELECT
            o.id,
            o.business_id,
            o.title,
            o.description,
            o.type,
            o.location,
            o.deadline,
            o.status,
            o.created_at,
            b.company_name
        FROM opportunities o
        INNER JOIN business_profiles b
            ON o.business_id = b.id
        WHERE o.id = ?
        LIMIT 1
    ");

    $stmt->execute([$id]);

    return $stmt->fetch(PDO::FETCH_ASSOC);
}
?>
