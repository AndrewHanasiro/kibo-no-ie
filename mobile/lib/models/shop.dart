class Location {
  final double latitude;
  final double longitude;

  Location({required this.latitude, required this.longitude});

  factory Location.fromJson(Map<String, dynamic> json) {
    return Location(
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
    );
  }
}

class Shop {
  final String id;
  final String name;
  final List<Location> locations;
  final String image;

  Shop({
    required this.id,
    required this.name,
    required this.locations,
    required this.image,
  });

  factory Shop.fromJson(Map<String, dynamic> json) {
    return Shop(
      id: json['id'] as String,
      name: json['name'] as String,
      locations:
          (json['locations'] as List<dynamic>?)
              ?.map((e) => Location.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      image: json['image'] as String,
    );
  }
}
