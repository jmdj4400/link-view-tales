# Admin User Setup Guide

## Step 1: Create Admin Account

1. Go to https://link-peek.org/auth
2. Sign up with the email you want to use as admin
3. Complete the email verification process
4. Complete onboarding

## Step 2: Assign Admin Role

Once you've created your account, I need to assign the admin role to your email address. 

**Please provide me with the email address you signed up with**, and I'll run the SQL command to grant you admin privileges.

The command I'll run will be:
```sql
SELECT assign_admin_by_email('your-email@example.com');
```

## Step 3: Access Admin Features

Once your admin role is assigned, you'll see an "Admin" dropdown in your dashboard navigation with access to:

### Blog Management
- **Manage Articles** (`/blog/manage`) - View, edit, and delete all articles
- **New Article** (`/blog/new`) - Create new blog posts
- **Article Editor** - Rich text WYSIWYG editor (like Microsoft Word)

### Admin Dashboard
- **Admin Dashboard** (`/admin`) - User management, roles, system metrics, and logs

## Rich Text Editor Features

The article editor now includes a modern WYSIWYG (What You See Is What You Write) interface with:

- **Text Formatting**: Bold, italic, underline, strikethrough
- **Headers**: H1 through H6
- **Lists**: Ordered and unordered lists
- **Alignment**: Left, center, right, justify
- **Colors**: Text and background colors
- **Links & Media**: Insert links, images, and videos
- **Code blocks**: For technical content
- **Blockquotes**: For highlighted quotes
- **Subscript & Superscript**: For mathematical or scientific content

## Email Notifications

When you publish an article (toggle the "Publish article" switch), all registered users will automatically receive an email notification about the new article. The email includes:

- Article title
- Author name
- Direct link to read the article
- Branded LinkPeek design

## Admin Navigation Quick Reference

From the Dashboard:
1. Click the **"Admin"** button in the top navigation
2. Select from:
   - **Admin Dashboard** - System management
   - **Manage Articles** - View all articles
   - **New Article** - Create new article

## Article Creation Workflow

1. Navigate to `/blog/new` or click "New Article" in the admin menu
2. Fill in required fields:
   - Title (required)
   - Description (required, 160 chars for SEO)
   - Category (required)
   - Content (required) - use the rich text editor
3. Optional fields:
   - Slug (auto-generated if empty)
   - Author name
   - Tags (comma-separated)
   - Featured image URL
4. Toggle "Publish article" to make it live
5. Click "Save"

When you publish, all users get an email notification automatically!

## Security Notes

- Admin role checks are enforced server-side via RLS policies
- Only admins can view all articles and access admin dashboard
- Regular users can only manage their own articles
- Email notifications are sent asynchronously via edge functions
