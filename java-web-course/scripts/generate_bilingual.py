import json, html

with open("chapters_bilingual.json", encoding="utf-8") as f:
    C = json.load(f)

# (file_key, kind, display_label)
# kind: 'ch' | 'review' | 'project'
STAGES = [
 ("阶段 0 · Java 必要基础", [
    ("ch01-environment.md","ch","01"),
    ("ch02-variables.md","ch","02"),
    ("ch03-branch-loop.md","ch","03"),
    ("ch04-array-methods.md","ch","04"),
    ("ch05-class-object.md","ch","05"),
    ("ch06-oop.md","ch","06"),
    ("ch07-modifiers-generics.md","ch","07"),
    ("ch08-collections-enum-exception.md","ch","08"),
    ("ch09-lambda-stream-annotation.md","ch","09"),
    ("review1.md","review","复习 1"),
 ]),
 ("阶段 1 · Web 通信原理", [
    ("ch10-http.md","ch","10"),
    ("ch11-servlet-tomcat.md","ch","11"),
    ("ch12-servlet-hello-lab.md","ch","12"),
    ("ch13-servlet-to-mvc.md","ch","13"),
    ("ch14-mvc-pattern.md","ch","14"),
    ("review2.md","review","复习 2"),
 ]),
 ("阶段 2 · Spring 核心与 Spring Boot", [
    ("ch15-ioc-di.md","ch","15"),
    ("ch16-bean-constructor-injection.md","ch","16"),
    ("ch17-maven.md","ch","17"),
    ("ch18-first-spring-boot-project.md","ch","18"),
    ("ch19-springbootapplication-autoconfig.md","ch","19"),
    ("ch20-spring-mvc-fullchain.md","ch","20"),
    ("project1-hello-spring-boot.md","project","Project 1"),
    ("ch21-json-jackson.md","ch","21"),
    ("ch22-restful-api-design.md","ch","22"),
    ("project2-user-api-memory.md","project","Project 2"),
    ("ch23-config-log-package.md","ch","23"),
    ("review3.md","review","复习 3"),
 ]),
 ("阶段 3 · 数据库与持久层", [
    ("ch24-database-basics.md","ch","24"),
    ("ch25-sql-basics.md","ch","25"),
    ("ch26-springboot-mysql.md","ch","26"),
    ("ch27-jdbc-mybatis.md","ch","27"),
    ("ch28-mybatis-plus.md","ch","28"),
    ("ch29-transactional.md","ch","29"),
    ("project3-user-crud-mysql.md","project","Project 3"),
    ("review4.md","review","复习 4"),
 ]),
 ("阶段 4 · 工程化与完整项目", [
    ("ch30-dto-entity-vo.md","ch","30"),
    ("ch31-validation.md","ch","31"),
    ("ch32-global-exception.md","ch","32"),
    ("ch33-cors-frontend.md","ch","33"),
    ("ch34-git-basics.md","ch","34"),
    ("ch35-debug.md","ch","35"),
    ("ch36-basic-testing.md","ch","36"),
    ("ch37-final-project-task-manager.md","project","Project 4"),
    ("review5.md","review","复习 5"),
    ("ch38-next-steps.md","ch","38"),
 ]),
]

def slugify(key):
    return key.replace(".md","").replace("_","-")

# ---------- TOC ----------
toc_parts = []
for stage_title, items in STAGES:
    toc_parts.append(f'<div class="toc-stage">{html.escape(stage_title)}</div>')
    toc_parts.append('<ol>')
    for key, kind, label in items:
        title = C[key]["title"]
        anchor = slugify(key)
        num_html = f'<span class="num">{label}</span>'
        toc_parts.append(f'<li><a href="#{anchor}">{num_html}{html.escape(title)}</a></li>')
    toc_parts.append('</ol>')
toc_html = "\n".join(toc_parts)

# ---------- Sections ----------
sections_parts = []
for stage_title, items in STAGES:
    sections_parts.append(f'<div class="stage-divider"><span>{html.escape(stage_title)}</span></div>')
    for key, kind, label in items:
        title = C[key]["title"]
        body_html = C[key]["html"]
        anchor = slugify(key)
        css_kind = {"ch":"kind-ch","review":"kind-review","project":"kind-project"}[kind]
        sections_parts.append(f'''
<section class="chapter {css_kind}" id="{anchor}">
  <div class="chapter-head"><span class="idx">{html.escape(label)}</span><h2>{html.escape(title)}</h2></div>
  <div class="chapter-body">
{body_html}
  </div>
</section>''')
sections_html = "\n".join(sections_parts)

with open("toc_bilingual.html","w",encoding="utf-8") as f:
    f.write(toc_html)
with open("sections_bilingual.html","w",encoding="utf-8") as f:
    f.write(sections_html)

print("toc chars:", len(toc_html), "sections chars:", len(sections_html))
