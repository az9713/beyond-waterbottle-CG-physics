"""Bundle the app and math fonts into a portable, offline HTML file."""
from pathlib import Path
import base64, re

root=Path(__file__).resolve().parent.parent
page=(root/'index.html').read_text()
for filename in ['vendor/katex/katex.min.css','style.css']:
    css=(root/filename).read_text()
    if 'katex' in filename:
        def font(match):
            name=match.group(1)
            path=root/'vendor/katex'/name
            if not path.is_file(): return match.group(0)
            return 'url(data:font/woff2;base64,'+base64.b64encode(path.read_bytes()).decode()+')'
        css=re.sub(r'url\((fonts/[^)]+\.woff2)\)',font,css)
    page=re.sub(r'<link rel="stylesheet" href="'+re.escape(filename)+r'(?:\?[^"<>]*)?">',lambda match:'<style>'+css+'</style>',page)
for filename in ['vendor/katex/katex.min.js','vendor/katex/contrib/auto-render.min.js','physics.js','stability-physics.js','stability-render.js','app.js','stability-ui.js']:
    script=(root/filename).read_text().replace('</script','<\\/script')
    page=re.sub(r'<script defer src="'+re.escape(filename)+r'(?:\?[^"<>]*)?"></script>','',page)
    page=page.replace('</body>','<script>'+script+'</script></body>')
icon=base64.b64encode((root/'assets/favicon.svg').read_bytes()).decode()
page=page.replace('href="assets/favicon.svg"','href="data:image/svg+xml;base64,'+icon+'"')
def embed_media(match):
    attr,name=match.groups()
    mime={'.mp4':'video/mp4','.jpg':'image/jpeg','.vtt':'text/vtt'}.get(Path(name).suffix)
    if not mime:return match.group(0)
    encoded=base64.b64encode((root/name).read_bytes()).decode()
    return attr+'="data:'+mime+';base64,'+encoded+'"'
page=re.sub(r'(src|poster)="(assets/[^"<>]+)"',embed_media,page)
page=page.replace('<head>','<head><!-- Bundled KaTeX MIT license:\n'+(root/'vendor/katex/LICENSE').read_text()+'\n-->')
page=page.replace('<title>Beyond','<title>Offline edition — Beyond')
(root/'standalone.html').write_text(page)
print('Built standalone.html:',len(page.encode()),'bytes')
