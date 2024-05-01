
const http = require('http')
const path = require('path')
const { createServerHandler } = require('next/dist/server/lib/render-server-standalone')

const dir = path.join(__dirname)

process.env.NODE_ENV = 'production'
process.chdir(__dirname)

// Make sure commands gracefully respect termination signals (e.g. from Docker)
// Allow the graceful termination to be manually configurable
if (!process.env.NEXT_MANUAL_SIG_HANDLE) {
  process.on('SIGTERM', () => process.exit(0))
  process.on('SIGINT', () => process.exit(0))
}

const currentPort = parseInt(process.env.PORT, 10) || 3000
const hostname = process.env.HOSTNAME || 'localhost'
const domainSocket = process.env.DOMAIN_SOCKET || ''
const keepAliveTimeout = parseInt(process.env.KEEP_ALIVE_TIMEOUT, 10);
const isValidKeepAliveTimeout =
  !Number.isNaN(keepAliveTimeout) &&
  Number.isFinite(keepAliveTimeout) &&
  keepAliveTimeout >= 0;
const nextConfig = {"env":{},"eslint":{"ignoreDuringBuilds":false},"typescript":{"ignoreBuildErrors":false,"tsconfigPath":"tsconfig.json"},"distDir":"./.next","cleanDistDir":true,"assetPrefix":"","configOrigin":"next.config.mjs","useFileSystemPublicRoutes":true,"generateEtags":true,"pageExtensions":["tsx","ts","jsx","js"],"poweredByHeader":true,"compress":true,"analyticsId":"","images":{"deviceSizes":[640,750,828,1080,1200,1920,2048,3840],"imageSizes":[16,32,48,64,96,128,256,384],"path":"/_next/image","loader":"default","loaderFile":"","domains":[],"disableStaticImages":false,"minimumCacheTTL":60,"formats":["image/webp"],"dangerouslyAllowSVG":false,"contentSecurityPolicy":"script-src 'none'; frame-src 'none'; sandbox;","contentDispositionType":"inline","remotePatterns":[],"unoptimized":false},"devIndicators":{"buildActivity":true,"buildActivityPosition":"bottom-right"},"onDemandEntries":{"maxInactiveAge":60000,"pagesBufferLength":5},"amp":{"canonicalBase":""},"basePath":"","sassOptions":{},"trailingSlash":false,"i18n":null,"productionBrowserSourceMaps":false,"optimizeFonts":true,"excludeDefaultMomentLocales":true,"serverRuntimeConfig":{},"publicRuntimeConfig":{},"reactProductionProfiling":false,"reactStrictMode":false,"httpAgentOptions":{"keepAlive":true},"outputFileTracing":true,"staticPageGenerationTimeout":60,"swcMinify":true,"output":"standalone","modularizeImports":{"@mui/icons-material":{"transform":"@mui/icons-material/{{member}}"},"date-fns":{"transform":"date-fns/{{member}}"},"lodash":{"transform":"lodash/{{member}}"},"lodash-es":{"transform":"lodash-es/{{member}}"},"ramda":{"transform":"ramda/es/{{member}}"},"react-bootstrap":{"transform":"react-bootstrap/{{member}}"},"antd":{"transform":"antd/lib/{{kebabCase member}}"},"ahooks":{"transform":"ahooks/es/{{member}}"},"@ant-design/icons":{"transform":"@ant-design/icons/lib/icons/{{member}}"}},"experimental":{"serverMinification":false,"serverSourceMaps":false,"caseSensitiveRoutes":false,"useDeploymentId":false,"useDeploymentIdServerActions":false,"clientRouterFilter":true,"clientRouterFilterRedirects":false,"fetchCacheKeyPrefix":"","middlewarePrefetch":"flexible","optimisticClientCache":true,"manualClientBasePath":false,"legacyBrowsers":false,"newNextLinkBehavior":true,"cpus":15,"memoryBasedWorkersCount":false,"sharedPool":true,"isrFlushToDisk":true,"workerThreads":false,"pageEnv":false,"optimizeCss":false,"nextScriptWorkers":false,"scrollRestoration":false,"externalDir":false,"disableOptimizedLoading":false,"gzipSize":true,"swcFileReading":true,"craCompat":false,"esmExternals":true,"appDir":true,"isrMemoryCacheSize":52428800,"fullySpecified":false,"outputFileTracingRoot":"/home/zhourunyu/ChatGPT-Next-Web","swcTraceProfiling":false,"forceSwcTransforms":true,"largePageDataBytes":128000,"adjustFontFallbacks":false,"adjustFontFallbacksWithSizeAdjust":false,"typedRoutes":false,"instrumentationHook":false,"trustHostHeader":false},"configFileName":"next.config.mjs","_originalRewrites":{"beforeFiles":[{"source":"/api/proxy/v1/:path*","destination":"https://api.openai.com/v1/:path*"},{"source":"/api/proxy/google/:path*","destination":"https://generativelanguage.googleapis.com/:path*"},{"source":"/api/proxy/openai/:path*","destination":"https://api.openai.com/:path*"},{"source":"/google-fonts/:path*","destination":"https://fonts.googleapis.com/:path*"},{"source":"/sharegpt","destination":"https://sharegpt.com/api/conversations"}],"afterFiles":[],"fallback":[]}}

process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(nextConfig)

createServerHandler({
  port: currentPort,
  hostname,
  domainSocket,
  dir,
  conf: nextConfig,
  keepAliveTimeout: isValidKeepAliveTimeout ? keepAliveTimeout : undefined,
}).then((nextHandler) => {
  const server = http.createServer(async (req, res) => {
    try {
      await nextHandler(req, res)
    } catch (err) {
      console.error(err);
      res.statusCode = 500
      res.end('Internal Server Error')
    }
  })

  if (isValidKeepAliveTimeout) {
    server.keepAliveTimeout = keepAliveTimeout
  }

  let endpoint
  if (domainSocket.length > 0) {
    endpoint = domainSocket
    if (endpoint.startsWith('@')) {
      endpoint = '\0' + endpoint.substring(1)
    }
  } else {
    endpoint = currentPort
  }

  server.listen(endpoint, async (err) => {
    if (err) {
      console.error("Failed to start server", err)
      process.exit(1)
    }

    url = domainSocket.length > 0 ? domainSocket : `http://${hostname}:${currentPort}`
    console.log(
      'Listening on port',
      currentPort,
      'url: ' + url
    )
  });

}).catch(err => {
  console.error(err);
  process.exit(1);
});