<script>
  export let title
  export let author
  export let date
  export let image
</script>

<div class="article">
  <h1>{title}</h1>
  <img src={'images/' + image} />
  <p class="date">on: {date}</p>
  <p class="date">by: {author}</p>
  <slot>
    <!-- the mdsvex content will be slotted in here -->
  </slot>
</div>

<style>
  .article {
    background: rgba(255,255,255,0.9);
    max-width: 960px;
    border: 2px solid var(--primary);
    margin: 24px;
    padding: 24px;
  }
</style>
