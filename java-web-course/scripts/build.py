import re, os, json
import markdown as md

BASE = "../chapters"

EXTENSIONS = ["tables", "fenced_code", "sane_lists", "def_list"]

DETAILS_RE = re.compile(
    r"<details>\s*<summary>(.*?)</summary>(.*?)</details>",
    re.DOTALL,
)

def render_details(match):
    summary = match.group(1).strip()
    inner_md = match.group(2).strip()
    inner_html = md.markdown(inner_md, extensions=EXTENSIONS)
    return f'<details><summary>{summary}</summary>\n{inner_html}\n</details>'

def load(fname):
    with open(os.path.join(BASE, fname), encoding="utf-8") as f:
        content = f.read()
    lines = content.split("\n")
    title_line = lines[0]
    title = re.sub(r"^#\s*", "", title_line).strip()
    body = "\n".join(lines[1:]).strip()

    # Pre-render <details><summary>...</summary>...</details> blocks' inner markdown,
    # then swap them out for placeholders so the outer markdown pass doesn't treat
    # them as opaque raw HTML (python-markdown does not parse markdown inside raw
    # HTML blocks by default).
    placeholders = []
    def stash(match):
        rendered = render_details(match)
        token = f"@@DETAILS_BLOCK_{len(placeholders)}@@"
        placeholders.append(rendered)
        return token
    body_stashed = DETAILS_RE.sub(stash, body)

    html_out = md.markdown(body_stashed, extensions=EXTENSIONS)

    for i, rendered in enumerate(placeholders):
        token = f"@@DETAILS_BLOCK_{i}@@"
        # markdown may wrap the bare token in <p>...</p>
        html_out = html_out.replace(f"<p>{token}</p>", rendered)
        html_out = html_out.replace(token, rendered)

    return title, html_out

def convert_all(manifest, outpath):
    out = {}
    for key, fname in manifest.items():
        title, html_body = load(fname)
        out[key] = {"title": title, "html": html_body}
    with open(outpath, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False)
    print("done", len(out))

manifest = {}
chapters = [
 "ch01-environment.md","ch02-variables.md","ch03-branch-loop.md","ch04-array-methods.md",
 "ch05-class-object.md","ch06-oop.md","ch07-modifiers-generics.md","ch08-collections-enum-exception.md",
 "ch09-lambda-stream-annotation.md","review1.md",
 "ch10-http.md","ch11-servlet-tomcat.md","ch12-servlet-hello-lab.md","ch13-servlet-to-mvc.md",
 "ch14-mvc-pattern.md","review2.md",
 "ch15-ioc-di.md","ch16-bean-constructor-injection.md","ch17-maven.md","ch18-first-spring-boot-project.md",
 "ch19-springbootapplication-autoconfig.md","ch20-spring-mvc-fullchain.md","project1-hello-spring-boot.md",
 "ch21-json-jackson.md","ch22-restful-api-design.md","project2-user-api-memory.md","ch23-config-log-package.md",
 "review3.md",
 "ch24-database-basics.md","ch25-sql-basics.md","ch26-springboot-mysql.md","ch27-jdbc-mybatis.md",
 "ch28-mybatis-plus.md","ch29-transactional.md","project3-user-crud-mysql.md","review4.md",
 "ch30-dto-entity-vo.md","ch31-validation.md","ch32-global-exception.md","ch33-cors-frontend.md",
 "ch34-git-basics.md","ch35-debug.md","ch36-basic-testing.md","ch37-final-project-task-manager.md",
 "review5.md","ch38-next-steps.md",
]
for c in chapters:
    manifest[c] = c

convert_all(manifest, "chapters.json")
