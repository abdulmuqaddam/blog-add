'use client';

/**
 * BlogSchema - Dynamic Schema.org JSON-LD Generator
 * Generates structured data for SEO based on blog content type
 */
export default function BlogSchema({ blog }) {
  if (!blog) return null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
  const blogUrl = `${siteUrl}/blog/${blog.slug}`;

  // Base schema structure
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': blog.schemaType || 'Article',
    headline: blog.title,
    description: blog.metaDescription || blog.subHeading || blog.excerpt || blog.content?.substring(0, 160) || '',
    image: blog.featuredImage ? [blog.featuredImage] : [],
    datePublished: blog.publishedAt || blog.createdAt,
    dateModified: blog.updatedAt || blog.createdAt,
    author: {
      '@type': 'Person',
      name: blog.author?.name || 'Blogify',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Blogify',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': blogUrl,
    },
    keywords: blog.tags?.join(', ') || '',
  };

  // Add thumbnailUrl using featuredImageAlt for the thumbnail
  if (blog.featuredImage) {
    baseSchema.thumbnailUrl = blog.featuredImage;
  }

  // Schema-type specific fields
  let schema;

  switch (blog.schemaType) {
    case 'NewsArticle':
      schema = {
        ...baseSchema,
        '@type': 'NewsArticle',
        articleSection: blog.category || 'General',
        wordCount: blog.content ? blog.content.split(/\s+/).length : 0,
      };
      break;

    case 'VideoObject':
      schema = {
        ...baseSchema,
        '@type': 'VideoObject',
        uploadDate: blog.publishedAt || blog.createdAt,
        // Video-specific fields
        embedUrl: blog.videoEmbedUrl || '',
        duration: blog.videoDuration ? formatDuration(blog.videoDuration) : '',
        thumbnail: blog.featuredImage ? {
          '@type': 'ImageObject',
          url: blog.featuredImage,
          alt: blog.featuredImageAlt || blog.title,
        } : undefined,
      };
      // Remove headline for VideoObject and use name instead
      delete schema.headline;
      schema.name = blog.title;
      break;

    case 'Article':
    default:
      schema = {
        ...baseSchema,
        '@type': 'Article',
        articleSection: blog.category || 'General',
        wordCount: blog.content ? blog.content.split(/\s+/).length : 0,
      };
      break;
  }

  // Add article body for Article and NewsArticle types
  if ((blog.schemaType === 'Article' || blog.schemaType === 'NewsArticle' || !blog.schemaType) && blog.content) {
    // Strip HTML tags for text content
    const textContent = blog.content.replace(/<[^>]*>/g, '').substring(0, 5000);
    schema.articleBody = textContent;
  }

  // Remove undefined fields
  Object.keys(schema).forEach((key) => {
    if (schema[key] === undefined || schema[key] === null || schema[key] === '') {
      delete schema[key];
    }
  });

  // Handle array with empty values
  if (schema.image && schema.image.length === 0) {
    delete schema.image;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Helper function to format duration to ISO 8601 duration format (PT#M#S)
function formatDuration(duration) {
  if (!duration) return '';

  // If already in ISO format, return as is
  if (duration.startsWith('PT')) return duration;

  // Try to parse different formats
  // Format: MM:SS or HH:MM:SS
  const parts = duration.split(':');
  
  if (parts.length === 2) {
    // MM:SS format
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    return `PT${minutes}M${seconds}S`;
  } else if (parts.length === 3) {
    // HH:MM:SS format
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);
    return `PT${hours}H${minutes}M${seconds}S`;
  }

  // If just a number, assume seconds
  const seconds = parseInt(duration, 10);
  if (!isNaN(seconds)) {
    return `PT${seconds}S`;
  }

  return '';
}

