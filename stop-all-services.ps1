Write-Host "Starting..."

Write-Host "Stop Auth Service"
Write-Host "Starting..."

function getparent{
    param([int] $child)
    
    (gwmi win32_process | ? processid -eq $($child)).parentprocessid
    #Stop-Process -Id (Get-NetTCPConnection -LocalPort 5001).OwningProcess -Force -ErrorAction SilentlyContinue
    
    }
    $ports = (gwmi win32_process) |% commandline |? { $_ -match 'serverless' }
    $ports |% {
        gps -id $(getparent $id) | stop-process -force
    }
    
    Write-Host "Finished"

Write-Host "Finished"


Write-Host "Finished"