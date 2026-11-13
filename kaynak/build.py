import pathlib
s=pathlib.Path(__file__).parent
css=(s/'style.css').read_text()
js='\n'.join((s/f).read_text() for f in ['core.js','sync.js','body.js','exdata.js','sport.js','diet.js','cal.js','pages.js','init.js'])
html=(s/'template.html').read_text().replace('/*CSS*/',css).replace('/*JS*/',js)

pathlib.Path(__file__).parent.parent/'index.html'.write_text(html)
print(len(html))
