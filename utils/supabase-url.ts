export const parseSupabaseUrl = (url: string) => {
  let parsedUrl = url;
  if (url.includes("#")) {
    // Récupère les paramètres après le #
    const [baseUrl, params] = url.split("#");
    // Reconstruit l'URL avec ? à la place de #
    parsedUrl = `${baseUrl}?${params}`;
  }
  return parsedUrl;
};
