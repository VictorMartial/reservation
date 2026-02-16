<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Confirmation de réservation</title>
</head>
<body>
    <h2>Bonjour {{ $reservation->user->name }},</h2>
    <p>Votre réservation n° <strong>{{ $reservation->id }}</strong> a été <strong>confirmée</strong>.</p>
    <p>Date de début : {{ $reservation->date_debut }}</p>
    <p>Date de fin : {{ $reservation->date_fin }}</p>
    <p>Merci pour votre confiance !</p>
</body>
</html>
