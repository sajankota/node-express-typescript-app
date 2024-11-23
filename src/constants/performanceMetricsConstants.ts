// src/constants/performanceMetricsConstants.ts

export const performanceMetricsConstants = [
    {
        id: "first-contentful-paint",
        name: "First Contentful Paint (FCP)",
        positiveText: "The first content of your page loads quickly, providing a positive first impression.",
        negativeText: "The first content of your page takes too long to load, which may cause users to leave.",
        tooltip: "First Contentful Paint measures the time it takes for the first piece of content to appear on the screen.",
    },
    {
        id: "largest-contentful-paint",
        name: "Largest Contentful Paint (LCP)",
        positiveText: "Your largest visible content loads quickly, improving user satisfaction.",
        negativeText: "Your largest visible content loads slowly, which can frustrate users.",
        tooltip: "Largest Contentful Paint measures the time it takes for the largest visible content to fully render.",
    },
    {
        id: "total-blocking-time",
        name: "Total Blocking Time (TBT)",
        positiveText: "Your site minimizes blocking, leading to a smoother user experience.",
        negativeText: "Your site has high blocking times, which may lead to poor user interactions.",
        tooltip: "Total Blocking Time measures the total time that your page is blocked from responding to user input.",
    },
    {
        id: "cumulative-layout-shift",
        name: "Cumulative Layout Shift (CLS)",
        positiveText: "Your page maintains stable content, resulting in a visually smooth experience.",
        negativeText: "Your page experiences shifts in layout, which can cause users to lose track of content.",
        tooltip: "Cumulative Layout Shift measures how much content shifts unexpectedly during page load.",
    },
    {
        id: "speed-index",
        name: "Speed Index (SI)",
        positiveText: "Your page content becomes visible quickly, providing a good user experience.",
        negativeText: "Your page content takes too long to appear, which could frustrate users.",
        tooltip: "Speed Index measures how quickly the contents of a page are visually displayed.",
    },
    {
        id: "interactive",
        name: "Time to Interactive (TTI)",
        positiveText: "Your page becomes interactive quickly, improving user engagement.",
        negativeText: "Your page takes too long to become interactive, which can frustrate users.",
        tooltip: "Time to Interactive measures the time it takes for your page to become fully interactive.",
    },
    {
        id: "max-potential-fid",
        name: "Max Potential First Input Delay (FID)",
        positiveText: "Your page responds quickly to user input, providing a responsive experience.",
        negativeText: "Your page has high input delay, which can frustrate users trying to interact.",
        tooltip: "Max Potential First Input Delay measures the longest delay between a user's action and the browser's response.",
    },
    {
        id: "first-meaningful-paint",
        name: "First Meaningful Paint (FMP)",
        positiveText: "Your page shows meaningful content quickly, providing a good user experience.",
        negativeText: "Your page takes too long to display meaningful content, which may lead to user frustration.",
        tooltip: "First Meaningful Paint measures when the primary content of the page is visible to the user.",
    },
    {
        id: "render-blocking-resources",
        name: "Render-Blocking Resources",
        positiveText: "Your page minimizes render-blocking resources, ensuring quicker load times.",
        negativeText: "Your page has render-blocking resources, delaying content load.",
        tooltip: "Render-Blocking Resources are elements (like JavaScript or CSS) that prevent your page from loading quickly.",
    },
    {
        id: "uses-responsive-images",
        name: "Responsive Images",
        positiveText: "Your page uses responsive images, ensuring that all devices see optimal images.",
        negativeText: "Your page doesn't use responsive images, which may affect load times and user experience.",
        tooltip: "Responsive Images ensure that the appropriate image sizes are served to different devices.",
    },
    {
        id: "offscreen-images",
        name: "Offscreen Images",
        positiveText: "Your page avoids loading unnecessary offscreen images, reducing load times.",
        negativeText: "Your page loads offscreen images, which may affect load performance.",
        tooltip: "Offscreen Images are those that are initially outside the visible viewport and shouldn't be loaded until needed.",
    },
    {
        id: "unminified-css",
        name: "Unminified CSS",
        positiveText: "Your page uses minified CSS, reducing load time.",
        negativeText: "Your page has unminified CSS, which may increase load times.",
        tooltip: "Minified CSS reduces the file size, improving page loading performance.",
    },
    {
        id: "unminified-javascript",
        name: "Unminified JavaScript",
        positiveText: "Your page uses minified JavaScript, improving load performance.",
        negativeText: "Your page has unminified JavaScript, which may increase load times.",
        tooltip: "Minified JavaScript removes unnecessary characters to reduce file size, enhancing performance.",
    },
    {
        id: "unused-css-rules",
        name: "Unused CSS Rules",
        positiveText: "Your page avoids loading unused CSS, improving load performance.",
        negativeText: "Your page loads unused CSS, which could increase load time.",
        tooltip: "Unused CSS Rules are those that aren't used by the current page and should be removed.",
    },
    {
        id: "unused-javascript",
        name: "Unused JavaScript",
        positiveText: "Your page avoids loading unused JavaScript, improving load performance.",
        negativeText: "Your page loads unused JavaScript, which may increase load times.",
        tooltip: "Unused JavaScript refers to scripts that aren't necessary for the page load and should be eliminated.",
    },
    {
        id: "uses-optimized-images",
        name: "Optimized Images",
        positiveText: "Your images are optimized, which helps improve load times and overall performance.",
        negativeText: "Your images are not optimized, which may slow down page load time.",
        tooltip: "Uses Optimized Images checks if images are properly optimized for faster page load times.",
    },
    {
        id: "modern-image-formats",
        name: "Modern Image Formats",
        positiveText: "You are using modern image formats like WebP or AVIF, which improve loading times.",
        negativeText: "You are not using modern image formats, which may increase load times.",
        tooltip: "Modern Image Formats like WebP and AVIF are more efficient than older formats, improving page load speed.",
    },
    {
        id: "uses-text-compression",
        name: "Text Compression",
        positiveText: "Text compression is enabled, which helps in reducing data transfer sizes.",
        negativeText: "Text compression is not enabled, which increases the amount of data transferred.",
        tooltip: "Uses Text Compression ensures that text resources are compressed, improving loading performance.",
    },
    {
        id: "uses-rel-preconnect",
        name: "Uses Preconnect",
        positiveText: "Preconnect is being used to speed up third-party connections.",
        negativeText: "Preconnect is not used, which could result in slower loading of external resources.",
        tooltip: "Uses Rel Preconnect allows browsers to connect early to external servers, speeding up resource loading.",
    },
    {
        id: "server-response-time",
        name: "Server Response Time",
        positiveText: "Your server responds quickly, providing a good user experience.",
        negativeText: "Your server response time is high, which may slow down the page loading process.",
        tooltip: "Server Response Time measures how quickly the server responds to requests, impacting page speed.",
    },
    {
        id: "redirects",
        name: "Redirects",
        positiveText: "There are minimal or no redirects, ensuring faster page loading.",
        negativeText: "There are multiple redirects, which may increase page load time.",
        tooltip: "Redirects can slow down page load times, so reducing them improves site speed.",
    },
    {
        id: "efficient-animated-content",
        name: "Efficient Animated Content",
        positiveText: "Your animated content is optimized to not affect page performance.",
        negativeText: "Your animated content is not optimized, which may degrade page performance.",
        tooltip: "Efficient Animated Content ensures that animations are implemented without compromising page performance.",
    },
    {
        id: "duplicated-javascript",
        name: "Duplicated JavaScript",
        positiveText: "No duplicated JavaScript found, keeping page load time optimized.",
        negativeText: "Duplicated JavaScript found, which may increase load time unnecessarily.",
        tooltip: "Duplicated JavaScript leads to larger page size and slower loading times.",
    },
    {
        id: "legacy-javascript",
        name: "Legacy JavaScript",
        positiveText: "Your JavaScript code is updated, ensuring compatibility and optimal performance.",
        negativeText: "Your page contains legacy JavaScript that could impact performance on modern browsers.",
        tooltip: "Legacy JavaScript is old code that may slow down the page on modern browsers.",
    },
    {
        id: "prioritize-lcp-image",
        name: "Prioritize LCP Image",
        positiveText: "Your LCP image is prioritized, improving the perceived load time.",
        negativeText: "Your LCP image is not prioritized, potentially affecting the user experience.",
        tooltip: "Prioritizing the Largest Contentful Paint (LCP) image helps improve loading performance for the main content.",
    },
    {
        id: "total-byte-weight",
        name: "Total Byte Weight",
        positiveText: "Your page's total byte weight is optimized, leading to fast loading times.",
        negativeText: "The page has a high total byte weight, which may slow down loading.",
        tooltip: "Total Byte Weight measures the total size of all resources loaded, impacting page load speed.",
    },
    {
        id: "uses-long-cache-ttl",
        name: "Uses Long Cache TTL",
        positiveText: "Long cache times are set, reducing the need for repeat downloads.",
        negativeText: "Short cache times are set, causing resources to be reloaded frequently.",
        tooltip: "Long Cache TTL helps reduce load times by caching resources for a longer period.",
    },
    {
        id: "dom-size",
        name: "DOM Size",
        positiveText: "Your DOM size is well optimized, ensuring efficient page rendering.",
        negativeText: "Your page has a large DOM size, which may lead to performance issues.",
        tooltip: "DOM Size measures the number of nodes in the document, which impacts rendering performance.",
    },
    {
        id: "critical-request-chains",
        name: "Critical Request Chains",
        positiveText: "No critical request chains detected, improving page speed.",
        negativeText: "Critical request chains are slowing down the loading process.",
        tooltip: "Critical Request Chains are resources that block the main thread, delaying page rendering.",
    },
    {
        id: "user-timings",
        name: "User Timings",
        positiveText: "User timings are well optimized to track key performance events.",
        negativeText: "User timings are not being properly tracked or are missing.",
        tooltip: "User Timings provide valuable performance metrics that help identify bottlenecks.",
    },
    {
        id: "bootup-time",
        name: "Bootup Time",
        positiveText: "Your page's bootup time is fast, ensuring quick interactivity.",
        negativeText: "Your page has a high bootup time, which may delay interactivity.",
        tooltip: "Bootup Time measures how quickly the JavaScript is executed, affecting the time to interactive.",
    },
    {
        id: "mainthread-work-breakdown",
        name: "Main Thread Work Breakdown",
        positiveText: "Main thread tasks are well distributed, ensuring a responsive experience.",
        negativeText: "Heavy main thread tasks detected, causing delays in responsiveness.",
        tooltip: "Main Thread Work Breakdown shows where time is spent on the main thread, affecting page responsiveness.",
    },
    {
        id: "font-display",
        name: "Font Display",
        positiveText: "Fonts are displayed efficiently without delaying page load.",
        negativeText: "Font display settings are causing delays in rendering text.",
        tooltip: "Font Display allows text to be rendered while fonts are loading, improving user experience.",
    },
    {
        id: "third-party-summary",
        name: "Third-Party Summary",
        positiveText: "Third-party content is well optimized, not affecting page performance.",
        negativeText: "Third-party content is slowing down your page's load time.",
        tooltip: "Third-Party Summary shows the impact of external resources on page performance.",
    },
    {
        id: "third-party-facades",
        name: "Third-Party Facades",
        positiveText: "Facades are effectively used to minimize the impact of third-party scripts.",
        negativeText: "Third-party scripts are causing performance issues due to missing facades.",
        tooltip: "Third-Party Facades help minimize the performance impact of third-party scripts by delaying loading until needed.",
    },
    {
        id: "layout-shifts",
        name: "Layout Shifts",
        positiveText: "Your page layout is stable, providing a visually consistent experience.",
        negativeText: "Frequent layout shifts detected, which can disrupt user experience.",
        tooltip: "Layout Shifts measures how often content moves during load, affecting visual stability.",
    },
    {
        id: "uses-passive-event-listeners",
        name: "Uses Passive Event Listeners",
        positiveText: "Passive event listeners are used, improving scrolling performance.",
        negativeText: "Missing passive event listeners detected, which may lead to scroll lag.",
        tooltip: "Passive Event Listeners allow smoother scrolling by not blocking the main thread.",
    },
    {
        id: "no-document-write",
        name: "No Document Write",
        positiveText: "The site does not use document.write(), ensuring better performance and reduced blocking.",
        negativeText: "The use of document.write() can slow down page load, leading to poor user experience.",
        tooltip: "Avoiding document.write() is a best practice for improving performance and avoiding blocking content rendering.",
    },
    {
        id: "long-tasks",
        name: "Long Tasks",
        positiveText: "No long-running tasks detected, which means the site provides a smooth experience.",
        negativeText: "Long-running tasks can lead to poor responsiveness and a subpar user experience.",
        tooltip: "Long tasks can cause significant input delay, making the page feel less responsive. Addressing long tasks helps improve performance.",
    },
    {
        id: "non-composited-animations",
        name: "Non-Composited Animations",
        positiveText: "All animations are composited, providing smoother transitions.",
        negativeText: "Non-composited animations can cause jank and poor visual experience for users.",
        tooltip: "Using composited animations allows the browser to optimize rendering, resulting in smoother visual effects.",
    },
    {
        id: "unsized-images",
        name: "Unsized Images",
        positiveText: "All images have specified dimensions, preventing layout shifts.",
        negativeText: "Images without specified dimensions can cause layout shifts, negatively impacting user experience.",
        tooltip: "Defining dimensions for images helps browsers allocate space and prevents layout shifts, improving stability.",
    },
    {
        id: "viewport",
        name: "Viewport",
        positiveText: "A viewport meta tag is present, ensuring proper scaling on different devices.",
        negativeText: "No viewport meta tag found, which can result in improper display on mobile devices.",
        tooltip: "The viewport meta tag controls the layout and scaling of the page on different devices, improving accessibility and readability.",
    },
    {
        id: "network-requests",
        name: "Network Requests",
        positiveText: "The number of network requests is within an acceptable range, indicating good load performance.",
        negativeText: "Too many network requests can lead to slower page load times and a poor user experience.",
        tooltip: "Reducing the number of network requests helps in improving the page load speed and reducing latency.",
    },
    {
        id: "network-rtt",
        name: "Network RTT",
        positiveText: "Network round-trip time (RTT) is low, indicating good network responsiveness.",
        negativeText: "High network RTT can lead to slower load times, affecting user experience.",
        tooltip: "Lower RTT means faster communication between the browser and the server, improving overall page performance.",
    },
    {
        id: "network-server-latency",
        name: "Network Server Latency",
        positiveText: "Low server latency detected, contributing to faster response times.",
        negativeText: "High server latency can delay resource loading, negatively impacting performance.",
        tooltip: "Server latency measures the time taken for the server to respond, and minimizing it helps improve page load times.",
    },
    {
        id: "main-thread-tasks",
        name: "Main Thread Tasks",
        positiveText: "Main thread tasks are optimized, leading to a smooth user experience.",
        negativeText: "Long main thread tasks can block the UI, resulting in poor responsiveness.",
        tooltip: "Optimizing main thread tasks ensures that the page remains responsive and interactive during user input.",
    },
    {
        id: "diagnostics",
        name: "Diagnostics",
        positiveText: "No significant issues found in diagnostics, indicating good page health.",
        negativeText: "Diagnostics found issues that could affect page performance and user experience.",
        tooltip: "Diagnostics provide an overview of potential issues that may impact the performance and usability of the page.",
    },
    {
        id: "metrics",
        name: "Metrics",
        positiveText: "All key metrics are performing well, indicating good page performance.",
        negativeText: "Some metrics are performing poorly, which could lead to a degraded user experience.",
        tooltip: "Key metrics provide a summary of the performance, accessibility, and usability of the page.",
    },
    {
        id: "screenshot-thumbnails",
        name: "Screenshot Thumbnails",
        positiveText: "Screenshots are optimized for better visual representation.",
        negativeText: "Screenshots are not optimized, which could impact visual clarity.",
        tooltip: "Screenshot thumbnails provide a visual overview of the page at different points during loading.",
    },
    {
        id: "final-screenshot",
        name: "Final Screenshot",
        positiveText: "Final screenshot represents the fully loaded page, indicating no critical issues.",
        negativeText: "Issues detected in the final rendering of the page can affect user perception.",
        tooltip: "The final screenshot captures the fully loaded page and helps identify any visual issues.",
    },
    {
        id: "script-treemap-data",
        name: "Script Treemap Data",
        positiveText: "Scripts are well-optimized, ensuring minimal impact on performance.",
        negativeText: "Large or unoptimized scripts can increase load time and impact performance.",
        tooltip: "The script treemap provides insights into the size and efficiency of JavaScript files loaded on the page.",
    },
    {
        id: "resource-summary",
        name: "Resource Summary",
        positiveText: "Resources are efficiently loaded, contributing to good page performance.",
        negativeText: "Inefficient resource loading can lead to poor performance and slow load times.",
        tooltip: "The resource summary provides a breakdown of all assets loaded on the page, including their size and loading times.",
    },
    {
        id: "largest-contentful-paint-element",
        name: "Largest Contentful Paint Element",
        positiveText: "Your Largest Contentful Paint (LCP) element loads quickly, enhancing user experience.",
        negativeText: "Your Largest Contentful Paint (LCP) element takes too long to load, negatively impacting user experience.",
        tooltip: "Largest Contentful Paint Element identifies the largest element visible during page load, affecting perceived performance.",
    },
    {
        id: "lcp-lazy-loaded",
        name: "LCP Lazy Loaded",
        positiveText: "Your LCP element is loaded efficiently, contributing to faster page load times.",
        negativeText: "Your LCP element is lazy-loaded, causing delays in rendering key content.",
        tooltip: "LCP Lazy Loaded checks if the Largest Contentful Paint element is delayed in loading, affecting performance.",
    },


];