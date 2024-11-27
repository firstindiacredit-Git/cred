declare module 'favicon-url' {
  function getFaviconUrl(url: string): Promise<string>;
  export default getFaviconUrl;
}
