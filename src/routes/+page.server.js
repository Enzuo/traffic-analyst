import fs from 'fs'
import path from 'path'
// import { svelte } from '@sveltejs/vite-plugin-svelte';
import matter from 'gray-matter'
import { marked } from 'marked'

export const prerender = true;

export async function load() {
  // const files1 =  fs.readdirSync('./')
  const files = fs.readdirSync('data/articles').filter((file) => file.endsWith('.md'))

  const articles = await Promise.all(
    files.map(async (file) => {
      const content = fs.readFileSync(path.resolve('data/articles', file), 'utf-8')
      const articleData = matter(content)
      const articleContent = marked.parse(articleData.content)

      // const preprocessed = await preprocess(
      //   content,
      //   mdsvex({
      //     layout: "/src/components/presentation/Article.svelte",
      //     extension: '.svx',
      //   })
      // );
      // const { code } = await compile(content, {layout: "src/components/presentation/Article.svelte"});
      //const preview = code.split('\n').slice(0, 5).join(' '); // Extract first 5 lines as preview
      return { file, frontmatter: articleData.data, content: articleContent }
    })
  )
  articles.sort((a, b) => {
    var dateA = new Date(a.frontmatter.date).getTime()
    var dateB = new Date(b.frontmatter.date).getTime()
    return (dateB - dateA)
  })
  return { articles }
}
