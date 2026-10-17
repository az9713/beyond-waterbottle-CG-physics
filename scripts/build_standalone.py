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
    page=page.replace(f'<link rel="stylesheet" href="{filename}">','<style>'+css+'</style>')
for filename in ['vendor/katex/katex.min.js','vendor/katex/contrib/auto-render.min.js','physics.js','app.js']:
    script=(root/filename).read_text().replace('</script','<\\/script')
    page=re.sub(r'<script defer src="'+re.escape(filename)+r'(?:\?[^"<>]*)?"></script>','',page)
    page=page.replace('</body>','<script>'+script+'</script></body>')
icon=base64.b64encode((root/'assets/favicon.svg').read_bytes()).decode()
page=page.replace('href="assets/favicon.svg"','href="data:image/svg+xml;base64,'+icon+'"')
page=page.replace('<head>','<head><!-- Bundled KaTeX MIT license:\n'+(root/'vendor/katex/LICENSE').read_text()+'\n-->')
page=page.replace('<title>Beyond','<title>Offline edition — Beyond')
(root/'standalone.html').write_text(page)
print('Built standalone.html:',len(page.encode()),'bytes')
