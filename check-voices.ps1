Add-Type -AssemblyName System.Speech
$voice = New-Object System.Speech.Synthesis.SpeechSynthesizer

Write-Host '=== All Installed Voices ===' -ForegroundColor Cyan
$voice.GetInstalledVoices() | ForEach-Object {
    $v = $_.VoiceInfo
    Write-Host ('Name: {0}' -f $v.Name)
    Write-Host ('  Culture: {0}' -f $v.Culture.Name)
    Write-Host ('  Gender: {0}' -f $v.Gender)
    Write-Host ('  Language: {0}' -f $v.Culture.TwoLetterISOLanguageName)
    Write-Host ''
}

Write-Host ''
Write-Host '=== Spanish Voices ===' -ForegroundColor Cyan
$spanishVoices = $voice.GetInstalledVoices() | Where-Object {
    $_.VoiceInfo.Culture.TwoLetterISOLanguageName -eq 'es'
}

if ($spanishVoices.Count -eq 0) {
    Write-Host 'WARNING: No Spanish voices found' -ForegroundColor Yellow
    Write-Host ''
    Write-Host 'To install Spanish voices on Windows 10/11:'
    Write-Host '1. Go to Settings > Time & Language > Language'
    Write-Host '2. Add Spanish (Mexico) or Spanish (Spain)'
    Write-Host '3. Click on the language and select Options'
    Write-Host '4. Download the Speech pack'
    Write-Host ''
    Write-Host 'Recommended voices:'
    Write-Host '  - Microsoft Sabina Desktop (Spanish - Mexico, Female)'
    Write-Host '  - Microsoft Helena Desktop (Spanish - Spain, Female)'
    Write-Host '  - Microsoft Raul Desktop (Spanish - Mexico, Male)'
} else {
    Write-Host ('SUCCESS: Found {0} Spanish voice(s):' -f $spanishVoices.Count) -ForegroundColor Green
    $spanishVoices | ForEach-Object {
        $v = $_.VoiceInfo
        Write-Host ('  - {0}' -f $v.Name) -ForegroundColor Green
        Write-Host ('    Culture: {0}, Gender: {1}' -f $v.Culture.Name, $v.Gender) -ForegroundColor Gray
    }
}
