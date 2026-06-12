<?php get_header(); ?>

<?php if (have_posts()) : while (have_posts()) : the_post(); ?>
  <article>
    <h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
    ページがありません。
  </article>
<?php endwhile; endif; ?>

<?php get_footer(); ?>
