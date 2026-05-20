import * as Linking from 'expo-linking';

export async function openRouteInMaps(
  address: string,
  latitude?: number,
  longitude?: number,
) {
  const query =
    latitude != null && longitude != null
      ? `${latitude},${longitude}`
      : encodeURIComponent(address);

  const url = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
  await Linking.openURL(url);
}
