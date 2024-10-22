const LocationFetch = async () => {
  if (navigator.geolocation) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;

          try {
            const response = await fetch(url);
            const data = await response.json();
            const { city } = data;
            resolve(city);
          } catch (error) {
            reject("Error fetching city from coordinates.");
          }
        },
        (error) => {
          reject("Geolocation permission denied or unavailable.");
        }
      );
    });
  } else {
    throw new Error("Geolocation is not supported by this browser.");
  }
};

export default LocationFetch;
