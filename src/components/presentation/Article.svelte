<script>
  export let title
  export let author
  export let date
  export let image
</script>

<div class="article">
  <div class="article-container">
    <h1>{title}</h1>
    <img src={'images/' + image} />
    <p class="date">{date}</p>
    <slot>
      <!-- the mdsvex content will be slotted in here -->
    </slot>
  </div>
</div>

<style>
  .article {
    background: rgba(255,255,255,0.9);
    max-width: 960px;
    padding: 24px;
  }

  @media (min-width: 960px) {
    .article {
      margin: 24px;
      border: 2px solid var(--primary);
    }
  }

  .date {
    margin: 0.5em;
    color: var(--secondary)
  }

  img {
    width:100%;
  }
</style>
