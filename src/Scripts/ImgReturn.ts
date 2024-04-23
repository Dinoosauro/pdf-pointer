/**
 * The container of all icons. The accent color is automatically applied to the SVG XML
 * @param id the identifier of the icon
 * @param accentColor if a custom accent color should be applied
 * @returns a string, of the SVG XML with the accent color applied
 */
export default function getImg(id: string, accentColor?: string): string {
    let style = `style="--accent: ${accentColor ?? getComputedStyle(document.body).getPropertyValue("--accent")}; --text: ${getComputedStyle(document.body).getPropertyValue("--text")}"`;
    return {
        logo: `<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" stroke-miterlimit="10" style="fill-rule:nonzero;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;${style.substring(0, style.length - 1).replace("style=\"", "")}" viewBox="0 0 24 24"><path fill="var(--accent)" d="M7.503 13.002a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 1 0v-.5H8.5a1.5 1.5 0 0 0 0-3h-.997Zm.997 2h-.497v-1H8.5a.5.5 0 1 1 0 1Zm6.498-1.5a.5.5 0 0 1 .5-.5h1.505a.5.5 0 1 1 0 1h-1.006l-.001 1.002h1.007a.5.5 0 0 1 0 1h-1.007l.002.497a.5.5 0 0 1-1 .002l-.003-.998v-.002l.003-2.002Zm-3.498-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h.498a2 2 0 0 0 0-4H11.5Zm.5 3v-2a1 1 0 0 1 0 2ZM20 20v-1.164c.591-.281 1-.884 1-1.582V12.75c0-.698-.409-1.3-1-1.582v-1.34a2 2 0 0 0-.586-1.414l-5.829-5.828a.491.491 0 0 0-.049-.04.63.63 0 0 1-.036-.03 2.072 2.072 0 0 0-.219-.18.652.652 0 0 0-.08-.044l-.048-.024-.05-.029c-.054-.031-.109-.063-.166-.087a1.977 1.977 0 0 0-.624-.138c-.02-.001-.04-.004-.059-.007A.605.605 0 0 0 12.172 2H6a2 2 0 0 0-2 2v7.168c-.591.281-1 .884-1 1.582v4.504c0 .698.409 1.3 1 1.582V20a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2Zm-2 .5H6a.5.5 0 0 1-.5-.5v-.996h13V20a.5.5 0 0 1-.5.5Zm.5-10.5v1h-13V4a.5.5 0 0 1 .5-.5h6V8a2 2 0 0 0 2 2h4.5Zm-1.122-1.5H14a.5.5 0 0 1-.5-.5V4.621L17.378 8.5Zm-12.628 4h14.5a.25.25 0 0 1 .25.25v4.504a.25.25 0 0 1-.25.25H4.75a.25.25 0 0 1-.25-.25V12.75a.25.25 0 0 1 .25-.25Z"/><path fill="var(--text)" d="M18.03 16.513a.516.516 0 0 0-.832.407v5.846c0 .49.617.704.92.32l1.44-1.822a.567.567 0 0 1 .445-.215h2.356a.516.516 0 0 0 .316-.923l-4.645-3.613Z"/></svg>`,
        laptop: `<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" stroke-miterlimit="10" style="fill-rule:nonzero;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;${style.substring(0, style.length - 1).replace("style=\"", "")}" viewBox="0 0 24 24"><path fill="var(--accent)" d="M.9 18.877h22.2a.9.9 0 0 1 .122 1.792l-.122.008H.9a.9.9 0 0 1-.122-1.792l.122-.008h22.2H.9Zm18.6-13.8c1.16 0 2.1.94 2.1 2.1v9a2.1 2.1 0 0 1-2.1 2.1h-15a2.1 2.1 0 0 1-2.1-2.1v-9c0-1.16.94-2.1 2.1-2.1h15Zm0 1.8h-15a.3.3 0 0 0-.3.3v9a.3.3 0 0 0 .3.3h15a.3.3 0 0 0 .3-.3v-9a.3.3 0 0 0-.3-.3Z"/><path fill="var(--accent)" d="M9.956 11.817a.188.188 0 0 0-.188.188v1.128a.188.188 0 1 0 .376 0v-.188h.187a.564.564 0 0 0 0-1.128h-.375Zm.375.752h-.187v-.376h.187a.188.188 0 1 1 0 .376Zm2.444-.564c0-.104.084-.188.188-.188h.566a.188.188 0 0 1 0 .376h-.378v.377h.378a.188.188 0 0 1 0 .376h-.379l.001.187a.188.188 0 0 1-.376 0l-.001-.375v-.753Zm-1.316-.188a.188.188 0 0 0-.188.188v1.128c0 .104.084.188.188.188h.187a.752.752 0 0 0 0-1.504h-.187Zm.188 1.128v-.752a.376.376 0 0 1 0 .752Zm3.01 1.504v-.438a.658.658 0 0 0 .376-.595v-1.694a.658.658 0 0 0-.377-.595v-.504c0-.2-.079-.39-.22-.532L12.243 7.9a.193.193 0 0 0-.018-.015l-.014-.011a.774.774 0 0 0-.082-.068l-.03-.017a.374.374 0 0 1-.018-.009l-.019-.01A.583.583 0 0 0 12 7.736a.744.744 0 0 0-.235-.052l-.022-.003a.226.226 0 0 0-.031-.002H9.39a.753.753 0 0 0-.752.752v2.696a.658.658 0 0 0-.376.595v1.694c0 .263.154.49.376.595v.438c0 .415.337.752.752.752h4.514a.753.753 0 0 0 .752-.752Zm-.753.188H9.39a.188.188 0 0 1-.188-.188v-.375h4.89v.375a.188.188 0 0 1-.188.188Zm.188-3.95v.377h-4.89V8.43c0-.104.085-.188.188-.188h2.257v1.692c0 .416.337.753.753.753h1.692Zm-.422-.564H12.4a.188.188 0 0 1-.189-.188v-1.27l1.46 1.458Zm-4.75 1.505h5.454c.052 0 .094.042.094.094v1.694a.094.094 0 0 1-.094.094H8.92a.094.094 0 0 1-.094-.094v-1.694c0-.052.042-.094.094-.094Z"/><path fill="var(--text)" d="M13.915 13.137a.194.194 0 0 0-.313.153v2.2c0 .183.232.264.346.12l.542-.685a.213.213 0 0 1 .168-.081h.886a.194.194 0 0 0 .119-.348l-1.748-1.359Z"/></svg>`,
        next: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M18.25 3a.75.75 0 0 1 .743.648L19 3.75v16.5a.75.75 0 0 1-1.493.102l-.007-.102V3.75a.75.75 0 0 1 .75-.75Zm-13.03.22a.75.75 0 0 1 .976-.073l.084.073 8.25 8.25a.75.75 0 0 1 .073.976l-.073.084-8.25 8.25a.75.75 0 0 1-1.133-.976l.073-.084L12.94 12 5.22 4.28a.75.75 0 0 1 0-1.06Z"/></svg>`,
        prev: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M5.75 3a.75.75 0 0 0-.743.648L5 3.75v16.5a.75.75 0 0 0 1.493.102l.007-.102V3.75A.75.75 0 0 0 5.75 3Zm13.03.22a.75.75 0 0 0-.976-.073l-.084.073-8.25 8.25a.75.75 0 0 0-.073.976l.073.084 8.25 8.25a.75.75 0 0 0 1.133-.976l-.073-.084L11.06 12l7.72-7.72a.75.75 0 0 0 0-1.06Z"/></svg>`,
        zoomin: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M13.5 10a.75.75 0 0 0-.75-.75h-2v-2a.75.75 0 0 0-1.5 0v2h-2a.75.75 0 1 0 0 1.5h2v2a.75.75 0 0 0 1.5 0v-2h2a.75.75 0 0 0 .75-.75ZM10 2.75a7.25 7.25 0 0 1 5.63 11.819l4.9 4.9a.75.75 0 0 1-.976 1.134l-.084-.073-4.901-4.9A7.25 7.25 0 1 1 10 2.75Zm0 1.5a5.75 5.75 0 1 0 0 11.5 5.75 5.75 0 0 0 0-11.5Z"/></svg>`,
        zoomout: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M12.75 9.25a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1 0-1.5h5.5Zm4.5.75a7.25 7.25 0 1 0-2.681 5.63l4.9 4.9.085.073a.75.75 0 0 0 .976-1.133l-4.9-4.901A7.22 7.22 0 0 0 17.25 10Zm-13 0a5.75 5.75 0 1 1 11.5 0 5.75 5.75 0 0 1-11.5 0Z"/></svg>`,
        pen: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M20.952 3.047a3.578 3.578 0 0 0-5.06 0L3.94 15a3.106 3.106 0 0 0-.825 1.476L2.02 21.077a.75.75 0 0 0 .904.903l4.601-1.096a3.106 3.106 0 0 0 1.477-.825L19 10.06a1.75 1.75 0 0 1-.006 2.47l-1.783 1.784a.75.75 0 1 0 1.06 1.06l1.784-1.783A3.25 3.25 0 0 0 20.06 9l.892-.892a3.578 3.578 0 0 0 0-5.06Zm-4 1.06a2.078 2.078 0 1 1 2.94 2.94L7.941 18.999c-.211.21-.475.357-.764.426l-3.416.813.813-3.415c.069-.29.217-.554.427-.764l11.95-11.951Z"/></svg>`,
        pen_fill: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M15.891 3.047a3.578 3.578 0 1 1 5.061 5.06L20.061 9a3.25 3.25 0 0 1-.005 4.592l-1.784 1.783a.75.75 0 1 1-1.06-1.06l1.783-1.784A1.75 1.75 0 0 0 19 10.06l-9.998 10a3.106 3.106 0 0 1-1.477.825L2.924 21.98a.75.75 0 0 1-.904-.903l1.096-4.602c.133-.559.419-1.07.825-1.476l11.95-11.952Z"/></svg>`,
        timer: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M12 5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17Zm0 1.5a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM12 8a.75.75 0 0 1 .743.648l.007.102v4.5a.75.75 0 0 1-1.493.102l-.007-.102v-4.5A.75.75 0 0 1 12 8Zm7.147-2.886.083.06 1.158.964a.75.75 0 0 1-.877 1.212l-.082-.06-1.159-.964a.75.75 0 0 1 .877-1.212ZM14.25 2.5a.75.75 0 0 1 .102 1.493L14.25 4h-4.5a.75.75 0 0 1-.102-1.493L9.75 2.5h4.5Z"/></svg>`,
        size: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M16.78 7.22c.142.14.22.331.22.53v2.5a.75.75 0 0 1-1.5 0v-.69l-1.72 1.72a.75.75 0 1 1-1.06-1.061L14.44 8.5h-.69a.75.75 0 0 1 0-1.5h2.5a.75.75 0 0 1 .53.22ZM7 16.25a.75.75 0 0 0 .75.75h2.501a.75.75 0 0 0 0-1.5h-.69l1.72-1.72a.75.75 0 0 0-1.061-1.06L8.5 14.438v-.69a.75.75 0 0 0-1.5 0v2.5Zm-5-9.5A2.75 2.75 0 0 1 4.75 4h14.5A2.75 2.75 0 0 1 22 6.75v10.5A2.75 2.75 0 0 1 19.25 20H4.75A2.75 2.75 0 0 1 2 17.25V6.75ZM4.75 5.5c-.69 0-1.25.56-1.25 1.25v10.5c0 .69.56 1.25 1.25 1.25h14.5c.69 0 1.25-.56 1.25-1.25V6.75c0-.69-.56-1.25-1.25-1.25H4.75Z"/></svg>`,
        circle: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Z"/></svg>`,
        circle_fill: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Z"/></svg>`,
        bucket: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M12 2.25a.75.75 0 0 0-1.5 0V3.5a2.24 2.24 0 0 0-.841.53L2.78 10.91a2.25 2.25 0 0 0 0 3.182L7.66 18.97a2.25 2.25 0 0 0 3.182 0l6.879-6.879a2.25 2.25 0 0 0 0-3.182L12.84 4.03A2.24 2.24 0 0 0 12 3.5V2.25Zm-8.159 9.72L10.5 5.31v1.44a.75.75 0 0 0 1.5 0V5.31l4.659 4.66a.75.75 0 0 1 0 1.06l-.97.97H3.812l.029-.03Zm.47 1.53h9.878L9.78 17.909a.75.75 0 0 1-1.06 0L4.31 13.5Zm15.21.102a.874.874 0 0 0-1.542 0l-2.008 3.766C14.85 19.466 16.372 22 18.75 22s3.898-2.534 2.78-4.632l-2.009-3.766Zm-2.227 4.471 1.456-2.73 1.456 2.73a1.65 1.65 0 1 1-2.912 0Z"/></svg>`,
        eraser: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="m15.87 2.669 4.968 4.968a2.25 2.25 0 0 1 0 3.182l-8.682 8.68 6.098.001a.75.75 0 0 1 .743.648l.007.102a.75.75 0 0 1-.648.743l-.102.007-8.41.001a2.244 2.244 0 0 1-1.714-.655l-4.969-4.969a2.25 2.25 0 0 1 0-3.182l9.527-9.526a2.25 2.25 0 0 1 3.182 0ZM5.708 11.768l-1.486 1.488a.75.75 0 0 0 0 1.06l4.969 4.969c.146.146.338.22.53.22l.029-.005.038.002a.747.747 0 0 0 .463-.217l1.486-1.487-6.029-6.03Zm8.04-8.039L6.77 10.707l6.03 6.03 6.979-6.978a.75.75 0 0 0 0-1.061l-4.969-4.969a.75.75 0 0 0-1.06 0Z"/></svg>`,
        eraser_fill: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="m15.87 2.669 4.968 4.968a2.25 2.25 0 0 1 0 3.182l-8.682 8.68 6.098.001a.75.75 0 0 1 .743.648l.007.102a.75.75 0 0 1-.648.743l-.102.007-8.41.001a2.244 2.244 0 0 1-1.714-.655l-4.969-4.969a2.25 2.25 0 0 1 0-3.182l9.527-9.526a2.25 2.25 0 0 1 3.182 0Zm-4.172 15.09-5.955-5.956-1.507 1.467a.75.75 0 0 0 0 1.06l4.946 4.946a.75.75 0 0 0 1.06-.016l1.455-1.502Z"/></svg>`,
        numbersquare: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M10.898 7.515a.75.75 0 0 1 .588.882l-.22 1.103h2.47l.28-1.397a.75.75 0 0 1 1.47.294l-.22 1.103h.984a.75.75 0 0 1 0 1.5h-1.285l-.4 2h1.185a.75.75 0 0 1 0 1.5h-1.485l-.28 1.398a.75.75 0 0 1-1.47-.295l.22-1.103h-2.47l-.28 1.398a.75.75 0 0 1-1.47-.295l.22-1.103H7.75a.75.75 0 0 1 0-1.5h1.286l.4-2H8.25a.75.75 0 0 1 0-1.5h1.486l.28-1.397a.75.75 0 0 1 .882-.588ZM10.565 13h2.47l.4-2h-2.47l-.4 2ZM3 6.25A3.25 3.25 0 0 1 6.25 3h11.5A3.25 3.25 0 0 1 21 6.25v11.5A3.25 3.25 0 0 1 17.75 21H6.25A3.25 3.25 0 0 1 3 17.75V6.25ZM6.25 4.5A1.75 1.75 0 0 0 4.5 6.25v11.5c0 .966.784 1.75 1.75 1.75h11.5a1.75 1.75 0 0 0 1.75-1.75V6.25a1.75 1.75 0 0 0-1.75-1.75H6.25Z"/></svg>`,
        numbersquare_fill: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="m13.436 11-.4 2h-2.47l.4-2h2.47ZM6.25 3A3.25 3.25 0 0 0 3 6.25v11.5A3.25 3.25 0 0 0 6.25 21h11.5A3.25 3.25 0 0 0 21 17.75V6.25A3.25 3.25 0 0 0 17.75 3H6.25Zm4.648 4.515a.75.75 0 0 1 .588.882l-.22 1.103h2.47l.28-1.397a.75.75 0 0 1 1.47.294l-.22 1.103h.984a.75.75 0 0 1 0 1.5h-1.285l-.4 2h1.185a.75.75 0 0 1 0 1.5h-1.485l-.28 1.398a.75.75 0 0 1-1.47-.295l.22-1.103h-2.47l-.28 1.398a.75.75 0 0 1-1.47-.295l.22-1.103H7.75a.75.75 0 0 1 0-1.5h1.286l.4-2H8.25a.75.75 0 0 1 0-1.5h1.486l.28-1.397a.75.75 0 0 1 .882-.588Z"/></svg>`,
        saveimg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" ${style}><path fill="var(--accent)" d="M17 6.125v2.91A3.529 3.529 0 0 0 16.5 9H16V6.125a.965.965 0 0 0-.289-.711l-2.125-2.125A.962.962 0 0 0 13 3.008V5.5a1.507 1.507 0 0 1-.922 1.383A1.327 1.327 0 0 1 11.5 7h-4a1.507 1.507 0 0 1-1.383-.922A1.327 1.327 0 0 1 6 5.5V3H5a.972.972 0 0 0-.703.289 1.081 1.081 0 0 0-.219.32A.856.856 0 0 0 4 4v10a.972.972 0 0 0 .078.391c.052.118.123.226.211.32a.854.854 0 0 0 .313.211c.127.049.262.075.398.078v-4.5a1.507 1.507 0 0 1 .922-1.383c.181-.082.379-.122.578-.117h5.992a3.489 3.489 0 0 0-2.442 1H6.5a.505.505 0 0 0-.5.5V15h3v1H5a1.884 1.884 0 0 1-.758-.156 2.2 2.2 0 0 1-.64-.422A1.9 1.9 0 0 1 3 14.039V4c-.001-.26.052-.519.156-.758a2.2 2.2 0 0 1 .422-.642 1.9 1.9 0 0 1 .622-.436c.24-.105.499-.16.761-.164h7.914c.262 0 .523.05.766.148.244.099.465.248.648.438l2.125 2.125c.186.185.332.405.43.648.099.244.152.503.156.766ZM7 3v2.5a.505.505 0 0 0 .5.5h4a.505.505 0 0 0 .5-.5V3H7Zm3 9.5a2.5 2.5 0 0 1 2.5-2.5h4a2.5 2.5 0 0 1 2.5 2.5v4c0 .51-.152.983-.414 1.379l-3.025-3.025a1.5 1.5 0 0 0-2.122 0l-3.025 3.025A2.488 2.488 0 0 1 10 16.5v-4Zm7 .25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm-5.879 5.836c.396.262.87.414 1.379.414h4c.51 0 .983-.152 1.379-.414l-3.025-3.025a.5.5 0 0 0-.708 0l-3.025 3.025Z"/></svg>`,
        minimize: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M21.778 2.222a.75.75 0 0 1 .072.976l-.072.084-6.223 6.224h5.693a.75.75 0 0 1 .743.65l.007.1a.75.75 0 0 1-.649.744l-.101.007-7.55-.002-.016-.002a.727.727 0 0 1-.195-.042l-.098-.046a.747.747 0 0 1-.386-.553l-.007-.105V2.753a.75.75 0 0 1 1.493-.102l.007.102v5.69l6.222-6.221a.749.749 0 0 1 1.06 0ZM11.003 13.754v7.504a.75.75 0 0 1-1.494.102l-.007-.102v-5.695L3.28 21.779a.75.75 0 0 1-1.133-.977l.073-.084 6.22-6.214H2.751a.75.75 0 0 1-.743-.648L2 13.754a.75.75 0 0 1 .75-.75l7.554.002.074.009.097.023.053.019.086.04.089.058a.756.756 0 0 1 .148.148l.066.106.041.093.022.071.01.055.007.058v-.008l.005.076Z"/></svg>`,
        alert: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M12 1.996a7.49 7.49 0 0 1 7.496 7.25l.004.25v4.097l1.38 3.156a1.249 1.249 0 0 1-1.145 1.75L15 18.502a3 3 0 0 1-5.995.177L9 18.499H4.275a1.251 1.251 0 0 1-1.147-1.747L4.5 13.594V9.496c0-4.155 3.352-7.5 7.5-7.5ZM13.5 18.5l-3 .002a1.5 1.5 0 0 0 2.993.145l.007-.147ZM12 3.496c-3.32 0-6 2.674-6 6v4.41L4.656 17h14.697L18 13.907V9.509l-.003-.225A5.988 5.988 0 0 0 12 3.496Z"/></svg>`,
        textadd: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" ${style}><path fill="var(--accent)" d="M3 3.5a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0V4H9v12h.207c.099.349.23.683.393 1H6.5a.5.5 0 0 1 0-1H8V4H4v1.5a.5.5 0 0 1-1 0v-2Zm16 11a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm-4-2a.5.5 0 0 0-1 0V14h-1.5a.5.5 0 0 0 0 1H14v1.5a.5.5 0 0 0 1 0V15h1.5a.5.5 0 0 0 0-1H15v-1.5Z"/></svg>`,
        text: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M18.25 3A2.75 2.75 0 0 1 21 5.75v12.5A2.75 2.75 0 0 1 18.25 21H5.75A2.75 2.75 0 0 1 3 18.25V5.75A2.75 2.75 0 0 1 5.75 3h12.5Zm0 1.5H5.75c-.69 0-1.25.56-1.25 1.25v12.5c0 .69.56 1.25 1.25 1.25h12.5c.69 0 1.25-.56 1.25-1.25V5.75c0-.69-.56-1.25-1.25-1.25Zm-4 7h-7.5l-.102.007A.75.75 0 0 0 6.75 13h7.5l.102-.007a.75.75 0 0 0-.102-1.493Zm-7.5 4h10.5a.75.75 0 0 1 .102 1.493L17.25 17H6.75a.75.75 0 0 1-.102-1.493l.102-.007Zm10.5-8H6.75l-.102.007A.75.75 0 0 0 6.75 9h10.5l.102-.007A.75.75 0 0 0 17.25 7.5Z"/></svg>`,
        text_fill: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M21 5.75A2.75 2.75 0 0 0 18.25 3H5.75A2.75 2.75 0 0 0 3 5.75v12.5A2.75 2.75 0 0 0 5.75 21h12.5A2.75 2.75 0 0 0 21 18.25V5.75Zm-6.75 5.75a.75.75 0 0 1 .102 1.493L14.25 13h-7.5a.75.75 0 0 1-.102-1.493l.102-.007h7.5Zm-7.5 4h10.5a.75.75 0 0 1 .102 1.493L17.25 17H6.75a.75.75 0 0 1-.102-1.493l.102-.007Zm10.5-8a.75.75 0 0 1 .102 1.493L17.25 9H6.75a.75.75 0 0 1-.102-1.493L6.75 7.5h10.5Z"/></svg>`,
        textadd_fill: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" ${style}><path fill="var(--accent)" d="M3 3.75A.75.75 0 0 1 3.75 3h10a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V4.5H9.5v7.706A5.48 5.48 0 0 0 9 14.5c0 .9.216 1.75.6 2.5H6.75a.75.75 0 0 1 0-1.5H8v-11H4.5v.75a.75.75 0 0 1-1.5 0v-1.5ZM19 14.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm-4-2a.5.5 0 0 0-1 0V14h-1.5a.5.5 0 0 0 0 1H14v1.5a.5.5 0 0 0 1 0V15h1.5a.5.5 0 0 0 0-1H15v-1.5Z"/></svg>`,
        textfont: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M7 2a.75.75 0 0 1 .704.49l2.952 7.985.012.032.223.602-.829 2.086-.626-1.694H4.564l-1.112 3.01a.75.75 0 0 1-1.407-.521l1.288-3.483a.752.752 0 0 1 .012-.033L6.297 2.49A.75.75 0 0 1 7.001 2Zm-1.88 8h3.762L7 4.914 5.119 10Zm8.687-3.527a.75.75 0 0 1 1.394 0l5.555 14.031h.494a.75.75 0 1 1 0 1.5H18.75a.75.75 0 1 1 0-1.5h.392l-1.19-3.004h-6.91l-1.192 3.004h.399a.75.75 0 1 1 0 1.5H7.75a.75.75 0 1 1 0-1.5h.486l5.57-14.03ZM17.359 16l-2.856-7.215L11.639 16h5.72Z"/></svg>`,
        textbold: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M6.935 4.44A1.5 1.5 0 0 1 7.996 4h4.383C15.017 4 17 6.182 17 8.625a4.63 4.63 0 0 1-.865 2.682c1.077.827 1.866 2.12 1.866 3.813C18 18.232 15.3 20 13.12 20H8a1.5 1.5 0 0 1-1.5-1.5l-.004-13c0-.397.158-.779.44-1.06ZM9.5 10.25h2.88c.903 0 1.62-.76 1.62-1.625S13.281 7 12.38 7H9.498l.002 3.25Zm0 3V17h3.62c.874 0 1.88-.754 1.88-1.88 0-1.13-.974-1.87-1.88-1.87H9.5Z"/></svg>`,
        textbold_fill: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M6 5.75C6 4.784 6.784 4 7.75 4h4.749c2.823 0 4.751 2.34 4.751 4.75 0 .931-.288 1.852-.803 2.632C17.369 12.239 18 13.47 18 15c0 3.133-2.677 5-5 5H7.75A1.75 1.75 0 0 1 6 18.25V5.75Zm3.5 7.75v3H13c.312 0 .71-.138 1.024-.421.288-.26.476-.615.476-1.079 0-.888-.745-1.5-1.5-1.5H9.5Zm0-3.5h3c.715 0 1.25-.592 1.25-1.25 0-.657-.536-1.25-1.251-1.25H9.5V10Z"/></svg>`,
        linespace: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="m19.53 3.22 2 2a.75.75 0 0 1-1.06 1.06l-.72-.72v4.69a.75.75 0 0 1-1.5 0V5.56l-.72.72a.75.75 0 1 1-1.06-1.06l2-2a.748.748 0 0 1 .528-.22h.004a.748.748 0 0 1 .528.22ZM2 5.75A.75.75 0 0 1 2.75 5h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 2 5.75Zm0 6.5a.75.75 0 0 1 .75-.75h11.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75ZM2.75 18a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Zm15.5.44v-4.69a.75.75 0 0 1 1.5 0v4.69l.72-.72a.75.75 0 1 1 1.06 1.06l-2 2a.748.748 0 0 1-1.06 0l-2-2a.75.75 0 1 1 1.06-1.06l.72.72Z"/></svg>`,
        textitalic: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M9.75 4h8.504a.75.75 0 0 1 .102 1.493l-.102.006h-3.197L10.037 18.5h4.213a.75.75 0 0 1 .742.648l.007.102a.75.75 0 0 1-.648.743L14.25 20h-9.5a.747.747 0 0 1-.746-.75c0-.38.28-.694.645-.743l.101-.007h3.685l.021-.065L13.45 5.499h-3.7a.75.75 0 0 1-.742-.648L9 4.75a.75.75 0 0 1 .648-.743L9.751 4h8.503-8.503Z"/></svg>`,
        textitalic_fill: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M10.649 18.5h3.847a1 1 0 0 1 0 2h-9.5a.997.997 0 0 1-.996-1c0-.552.445-1 .996-1h3.51L13.332 6H9.997a1 1 0 0 1 0-2H18.5a1 1 0 0 1 0 2h-3.025L10.65 18.5Z"/></svg>`,
        textunderline: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M6.75 19h10.5a.75.75 0 0 1 .102 1.493l-.102.007H6.75a.75.75 0 0 1-.102-1.493L6.75 19h10.5-10.5Zm10.5-15a.75.75 0 0 1 .743.648L18 4.75v6c0 4.394-2.063 6.75-6.003 6.75-3.855 0-5.91-2.255-5.994-6.466L6 10.75v-6a.75.75 0 0 1 1.493-.102l.007.102v6C7.496 14.358 8.933 16 11.997 16c2.985 0 4.428-1.56 4.5-4.976l.003-.274v-6a.75.75 0 0 1 .75-.75Z"/></svg>`,
        textunderline_fill: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M6 4.5a1 1 0 0 1 2 0v6.001c-.003 3.463 1.32 4.999 4.247 4.999 2.928 0 4.253-1.537 4.253-5v-6a1 1 0 1 1 2 0v6c0 4.54-2.18 7-6.253 7S5.996 15.039 6 10.5v-6ZM7 21a1 1 0 1 1 0-2h10.5a1 1 0 1 1 0 2H7Z"/></svg>`,
        textstrikethrough: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M4.75 12h14.5a.75.75 0 0 1 .102 1.493l-.101.007h-2.975c.88.813 1.336 1.793 1.336 2.935 0 2.825-3.232 4.64-6.754 4.23-2.235-.26-3.809-1.155-4.635-2.702a.75.75 0 0 1 1.323-.707c.57 1.068 1.702 1.712 3.485 1.92 2.743.318 5.081-.995 5.081-2.741 0-1.172-.805-2.127-2.565-2.886l-.116-.049H4.75a.75.75 0 0 1-.743-.648L4 12.75a.75.75 0 0 1 .648-.743L4.75 12h14.5-14.5Zm1.511-3.877c.152-2.83 2.822-4.468 6.324-4.061 2.188.254 3.863 1.053 4.982 2.409a.75.75 0 1 1-1.157.955c-.852-1.033-2.17-1.662-3.999-1.874-2.717-.316-4.65.804-4.65 2.571 0 .772.234 1.348.83 1.982l.128.132c.094.096.197.195.25.24l.031.02H7.08l-.024-.038c-.143-.206-.856-1.195-.795-2.336Z"/></svg>`,
        textstrikethrough_fill: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M13.848 11.5H19.5a1 1 0 0 1 0 2h-2.387a4.03 4.03 0 0 1 .998 2.684c0 2.93-3.28 4.915-7.033 4.48-2.328-.271-3.965-1.22-4.827-2.833-.26-.487-.207-1.016.248-1.331.455-.316 1.256-.099 1.516.388.533.998 1.604 1.592 3.294 1.789 2.586.3 4.802-.91 4.802-2.492 0-1.099-.547-1.94-2.107-2.685H5a1 1 0 1 1 0-2H13.848ZM6.987 9.695a5.122 5.122 0 0 1-.298-.51c-.3-.59-.468-1.214-.435-1.835.16-2.965 2.934-4.713 6.602-4.287 2.26.263 3.99 1.084 5.147 2.487a.993.993 0 0 1-.153 1.4c-.426.351-1.049.326-1.4-.1-.813-.985-2.068-1.596-3.825-1.8-2.56-.298-4.371.718-4.371 2.323 0 .714.239 1.22.762 1.81.225.254.647.525 1.265.815H7.192a38.03 38.03 0 0 1-.205-.303Z"/></svg>`,
        linethickness: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M2.75 3.5a.75.75 0 0 0 0 1.5h18.5a.75.75 0 0 0 0-1.5H2.75ZM2 10.75c0-.69.56-1.25 1.25-1.25h17.5a1.25 1.25 0 1 1 0 2.5H3.25C2.56 12 2 11.44 2 10.75Zm0 7.5c0-.966.784-1.75 1.75-1.75h16.5a1.75 1.75 0 1 1 0 3.5H3.75A1.75 1.75 0 0 1 2 18.25Z"/></svg>`,
        slidehide: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M6.75 3A4.75 4.75 0 0 0 2 7.75v7A2.25 2.25 0 0 0 4.25 17h.25v-1.5h-.25a.75.75 0 0 1-.75-.75v-7A3.25 3.25 0 0 1 6.75 4.5h10a.75.75 0 0 1 .75.75v.25H19v-.25A2.25 2.25 0 0 0 16.75 3h-10Zm12.504 3.5h.496a2.25 2.25 0 0 1 2.245 2.096L22 8.75v1.004a.75.75 0 0 1-1.493.101l-.007-.101V8.75a.75.75 0 0 0-.648-.743L19.75 8h-.496a.75.75 0 0 1-.102-1.493l.102-.007Zm-13.004 5a.75.75 0 0 1 .743.649l.007.102v2.494a.75.75 0 0 1-1.493.102l-.007-.102v-2.494a.75.75 0 0 1 .75-.75Zm.743 5.643a.75.75 0 0 0-1.493.102v1.005l.005.154A2.25 2.25 0 0 0 7.75 20.5h.5l.102-.007A.75.75 0 0 0 8.25 19h-.5l-.102-.007A.75.75 0 0 1 7 18.25v-1.005l-.007-.102ZM22 17.245a.75.75 0 1 0-1.5 0v1.005a.75.75 0 0 1-.75.75h-1.003a.75.75 0 0 0 0 1.5h1.003A2.25 2.25 0 0 0 22 18.25v-1.005ZM14.753 19h1.495a.75.75 0 0 1 .102 1.493l-.102.007h-1.495a.75.75 0 0 1-.102-1.493l.102-.007Zm-2.507 0h-1.495l-.102.007a.75.75 0 0 0 .102 1.493h1.495l.102-.007A.75.75 0 0 0 12.246 19Zm9.747-6.851a.75.75 0 0 0-1.493.102v2.494l.007.102A.75.75 0 0 0 22 14.745v-2.494l-.007-.102ZM9.503 7.25a.75.75 0 0 0-.75-.75H7.75A2.25 2.25 0 0 0 5.5 8.75v1.004a.75.75 0 0 0 1.5 0V8.75A.75.75 0 0 1 7.75 8h1.003a.75.75 0 0 0 .75-.75Zm5.746-.75h1.503a.75.75 0 0 1 .102 1.493L16.752 8h-1.503a.75.75 0 0 1-.102-1.493l.102-.007Zm-2.504 0H11.25l-.102.007A.75.75 0 0 0 11.25 8h1.495l.102-.007a.75.75 0 0 0-.102-1.493Z"/></svg>`,
        photofilter: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M9.5 2a7.503 7.503 0 0 1 7.179 5.321 7.5 7.5 0 1 1-9.357 9.358A7.5 7.5 0 0 1 9.5 2Zm7.486 7.038.01.22L17 9.5a7.5 7.5 0 0 1-7.962 7.486 6 6 0 1 0 7.947-7.948ZM9.5 3.5a6 6 0 0 0-2.486 11.463l-.01-.22L7 14.5a7.5 7.5 0 0 1 7.962-7.486A5.999 5.999 0 0 0 9.5 3.5Z"/></svg>`,
        fullscreenmaximize: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M4.5 5.75c0-.69.56-1.25 1.25-1.25h2a.75.75 0 0 0 0-1.5h-2A2.75 2.75 0 0 0 3 5.75v2a.75.75 0 0 0 1.5 0v-2Zm0 12.5c0 .69.56 1.25 1.25 1.25h2a.75.75 0 0 1 0 1.5h-2A2.75 2.75 0 0 1 3 18.25v-2a.75.75 0 0 1 1.5 0v2ZM18.25 4.5c.69 0 1.25.56 1.25 1.25v2a.75.75 0 0 0 1.5 0v-2A2.75 2.75 0 0 0 18.25 3h-2a.75.75 0 0 0 0 1.5h2Zm1.25 13.75c0 .69-.56 1.25-1.25 1.25h-2a.75.75 0 0 0 0 1.5h2A2.75 2.75 0 0 0 21 18.25v-2a.75.75 0 0 0-1.5 0v2Z"/></svg>`,
        fullscreenminimize: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M8.5 3.75a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 0 0 1.5h2.5A2.25 2.25 0 0 0 8.5 6.25v-2.5Zm0 16.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 0-.75-.75h-2.5a.75.75 0 0 1 0-1.5h2.5a2.25 2.25 0 0 1 2.25 2.25v2.5ZM16.25 3a.75.75 0 0 0-.75.75v2.5a2.25 2.25 0 0 0 2.25 2.25h2.5a.75.75 0 0 0 0-1.5h-2.5a.75.75 0 0 1-.75-.75v-2.5a.75.75 0 0 0-.75-.75Zm-.75 17.25a.75.75 0 0 0 1.5 0v-2.5a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 0 0-1.5h-2.5a2.25 2.25 0 0 0-2.25 2.25v2.5Z"/></svg>`,
        delete: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M10 5h4a2 2 0 1 0-4 0ZM8.5 5a3.5 3.5 0 1 1 7 0h5.75a.75.75 0 0 1 0 1.5h-1.32L18.76 18.611A3.75 3.75 0 0 1 15.026 22H8.974a3.75 3.75 0 0 1-3.733-3.389L4.07 6.5H2.75a.75.75 0 0 1 0-1.5H8.5Zm2 4.75a.75.75 0 0 0-1.5 0v7.5a.75.75 0 0 0 1.5 0v-7.5ZM14.25 9a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-1.5 0v-7.5a.75.75 0 0 1 .75-.75Zm-7.516 9.467a2.25 2.25 0 0 0 2.24 2.033h6.052a2.25 2.25 0 0 0 2.24-2.033L18.424 6.5H5.576l1.158 11.967Z"/></svg>`,
        settings: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M12.012 2.25c.734.008 1.465.093 2.182.253a.75.75 0 0 1 .582.649l.17 1.527a1.384 1.384 0 0 0 1.927 1.116l1.4-.615a.75.75 0 0 1 .85.174 9.793 9.793 0 0 1 2.205 3.792.75.75 0 0 1-.272.825l-1.241.916a1.38 1.38 0 0 0 0 2.226l1.243.915a.75.75 0 0 1 .272.826 9.798 9.798 0 0 1-2.204 3.792.75.75 0 0 1-.849.175l-1.406-.617a1.38 1.38 0 0 0-1.926 1.114l-.17 1.526a.75.75 0 0 1-.571.647 9.518 9.518 0 0 1-4.406 0 .75.75 0 0 1-.572-.647l-.169-1.524a1.382 1.382 0 0 0-1.925-1.11l-1.406.616a.75.75 0 0 1-.85-.175 9.798 9.798 0 0 1-2.203-3.796.75.75 0 0 1 .272-.826l1.243-.916a1.38 1.38 0 0 0 0-2.226l-1.243-.914a.75.75 0 0 1-.272-.826 9.793 9.793 0 0 1 2.205-3.792.75.75 0 0 1 .85-.174l1.4.615a1.387 1.387 0 0 0 1.93-1.118l.17-1.526a.75.75 0 0 1 .583-.65c.717-.159 1.449-.243 2.201-.252Zm0 1.5a9.136 9.136 0 0 0-1.354.117l-.11.977A2.886 2.886 0 0 1 6.526 7.17l-.899-.394A8.293 8.293 0 0 0 4.28 9.092l.797.587a2.881 2.881 0 0 1 .001 4.643l-.799.588c.32.842.776 1.626 1.348 2.322l.905-.397a2.882 2.882 0 0 1 4.017 2.318l.109.984c.89.15 1.799.15 2.688 0l.11-.984a2.881 2.881 0 0 1 4.018-2.322l.904.396a8.299 8.299 0 0 0 1.348-2.318l-.798-.588a2.88 2.88 0 0 1-.001-4.643l.797-.587a8.293 8.293 0 0 0-1.348-2.317l-.897.393a2.884 2.884 0 0 1-4.023-2.324l-.109-.976a8.99 8.99 0 0 0-1.334-.117ZM12 8.25a3.75 3.75 0 1 1 0 7.5 3.75 3.75 0 0 1 0-7.5Zm0 1.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z"/></svg>`,
        export: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="M12.28 2.22a.75.75 0 0 0-1.06 0l-5 5a.75.75 0 0 0 1.06 1.06L11 4.56v13.69a.75.75 0 0 0 1.5 0V4.56l3.72 3.72a.75.75 0 1 0 1.06-1.06l-5-5ZM5.25 20.5a.75.75 0 0 0 0 1.5h13a.75.75 0 0 0 0-1.5h-13Z"/></svg>`,
        app: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ${style}><path fill="var(--accent)" d="m18.492 2.33 3.179 3.18a2.25 2.25 0 0 1 0 3.182l-2.584 2.584A2.25 2.25 0 0 1 21 13.5v5.25A2.25 2.25 0 0 1 18.75 21H5.25A2.25 2.25 0 0 1 3 18.75V5.25A2.25 2.25 0 0 1 5.25 3h5.25a2.25 2.25 0 0 1 2.225 1.915l2.585-2.585a2.25 2.25 0 0 1 3.182 0ZM4.5 18.75c0 .415.336.75.75.75h5.999l.001-6.75H4.5v6Zm8.249.75h6.001a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75h-6.001v6.75ZM10.5 4.5H5.25a.75.75 0 0 0-.75.75v6h6.75v-6a.75.75 0 0 0-.75-.75Zm2.25 4.81v1.94h1.94l-1.94-1.94Zm3.62-5.918L13.193 6.57a.75.75 0 0 0 0 1.061l3.179 3.179a.75.75 0 0 0 1.06 0l3.18-3.179a.75.75 0 0 0 0-1.06l-3.18-3.18a.75.75 0 0 0-1.06 0Z"/></svg>`
    }[id] ?? "";
}