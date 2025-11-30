Add-Type -AssemblyName System.Speech
$voice = New-Object System.Speech.Synthesis.SpeechSynthesizer

# Get all Spanish voices
$spanishVoices = $voice.GetInstalledVoices() | Where-Object {
    $_.VoiceInfo.Culture.TwoLetterISOLanguageName -eq 'es'
}

if ($spanishVoices.Count -eq 0) {
    Write-Host "⚠ No Spanish voice installed. Skipping Spanish TTS."
    exit 1
}

# Prefer female voice, otherwise use first Spanish voice
$selectedVoice = ($spanishVoices | Where-Object {
    $_.VoiceInfo.Gender -eq 'Female'
} | Select-Object -First 1)

if ($null -eq $selectedVoice) {
    $selectedVoice = $spanishVoices[0]
}

$voiceName = $selectedVoice.VoiceInfo.Name
$voiceCulture = $selectedVoice.VoiceInfo.Culture.Name
$voiceGender = $selectedVoice.VoiceInfo.Gender

Write-Host "✓ Using Spanish voice: $voiceName ($voiceCulture, $voiceGender)"

$voice.SelectVoice($voiceName)
$voice.Rate = 0
$voice.Volume = 100
$voice.SetOutputToWaveFile('C:\Users\carlos.quesada\imaginelearning\reading-hero\public\audio\spanish\dog-es.wav')
$voice.Speak('perro')
$voice.Dispose()

Write-Host 'SUCCESS: Spanish audio generated'