$main_location = Get-Location

$auth = "$main_location\backend\services\auth"
$customers = "$main_location\backend\services\customers"
$merchants = "$main_location\backend\services\merchants"
$users = "$main_location\backend\services\users"
$settings = "$main_location\backend\services\settings"
$documents = "$main_location\backend\services\documents"
$payments = "$main_location\backend\services\payments"
$transactions = "$main_location\backend\services\transactions"
$virtual_terminal = "$main_location\backend\services\virtual_terminal"
$taxonomies = "$main_location\backend\services\taxonomies"
$notifications = "$main_location\backend\services\notifications"
$push_notifications = "$main_location\backend\services\push-notifications"

Write-Host "Starting..."

Start-Process PowerShell -ArgumentList "Write-Host 'Start Auth Service';  npm run-script watch --prefix '$auth';"
Start-Process PowerShell -ArgumentList "Write-Host 'Start Customers Service'; npm run-script watch --prefix '$customers'; Read-Host"
Start-Process PowerShell -ArgumentList "Write-Host 'Start Merchants Service'; npm run-script watch --prefix '$merchants'; Read-Host"
Start-Process PowerShell -ArgumentList "Write-Host 'Start Users Service'; npm run-script watch --prefix '$users'; Read-Host"
Start-Process PowerShell -ArgumentList "Write-Host 'Start Settings Service'; npm run-script watch --prefix '$settings'; Read-Host"
Start-Process PowerShell -ArgumentList "Write-Host 'Start Documents Service'; npm run-script watch --prefix '$documents'; Read-Host"
Start-Process PowerShell -ArgumentList "Write-Host 'Start Payments Service'; npm run-script watch --prefix '$payments'; Read-Host"
Start-Process PowerShell -ArgumentList "Write-Host 'Start Transactions Service'; npm run-script watch --prefix '$transactions'; Read-Host"
Start-Process PowerShell -ArgumentList "Write-Host 'Start Virtual Terminal Service'; npm run-script watch --prefix '$virtual_terminal'; Read-Host"
Start-Process PowerShell -ArgumentList "Write-Host 'Start Taxonomies Service'; npm run-script watch --prefix '$taxonomies'; Read-Host"
Start-Process PowerShell -ArgumentList "Write-Host 'Start Notifications Service'; npm run-script watch --prefix '$notifications'; Read-Host"
Start-Process PowerShell -ArgumentList "Write-Host 'Start Push Notifications Service'; npm run-script watch --prefix '$push_notifications'; Read-Host"

Write-Host "All services was started"

Write-Host $dat