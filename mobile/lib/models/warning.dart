class Warning {
  final String id;
  final String text;
  final DateTime timestamp;

  Warning({
    required this.id,
    required this.text,
    required this.timestamp,
  });

  factory Warning.fromJson(Map<String, dynamic> json) {
    return Warning(
      id: json['id'] as String,
      text: json['text'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
    );
  }
}
