Add-Type -AssemblyName System.Speech
$voice = New-Object System.Speech.Synthesis.SpeechSynthesizer

Write-Host 'Testing Spanish TTS...'
$voice.SelectVoice('Microsoft Sabina Desktop')
$voice.SetOutputToWaveFile('C:\Users\carlos.quesada\imaginelearning\reading-hero\public\audio\spanish\test.wav')
$voice.Speak('gato')
$voice.Dispose()

if (Test-Path 'C:\Users\carlos.quesada\imaginelearning\reading-hero\public\audio\spanish\test.wav') {
    Write-Host 'SUCCESS: File created'
} else {
    Write-Host 'ERROR: File not created'
}
