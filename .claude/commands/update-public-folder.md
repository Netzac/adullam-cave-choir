Read CLAUDE.md for full project context.

The public/ folder is empty and needs to be set up with 
the correct asset structure. Do the following:

1. Create these folders inside public/:
   public/
     images/
       programs/
       equipment/
       gallery/
         rehearsals/
         events/
         installations/
       team/
     icons/

2. Create a public/images/README.md explaining the 
   expected real images to be replaced later:

   # Image Assets Guide
   
   ## Logo
   - logo.png — Adullam Cave Choir logo, PNG with 
     transparent background, minimum 400px wide
   
   ## Hero
   - hero-bg.jpg — Full width hero background, 
     minimum 1920x1080px, choir or worship scene
   
   ## About
   - about.jpg — About page image, choir group photo
     or rehearsal scene, minimum 800x600px
   
   ## Programs (800x600px each)
   - programs/young-choristers.jpg
   - programs/worship-leadership.jpg  
   - programs/instrument-training.jpg
   
   ## Equipment (800x600px each)
   - equipment/installation.jpg
   - equipment/piano.jpg
   - equipment/sound-system.jpg
   - equipment/organ.jpg
   
   ## Gallery Samples (1200x800px each)
   - gallery/rehearsals/rehearsal-1.jpg
   - gallery/rehearsals/rehearsal-2.jpg
   - gallery/rehearsals/rehearsal-3.jpg
   - gallery/events/event-1.jpg
   - gallery/events/event-2.jpg
   - gallery/installations/install-1.jpg
   - gallery/installations/install-2.jpg
   
   ## Team
   - team/placeholder.jpg — Team member placeholder
   
   ## Icons
   - icons/favicon.ico
   - icons/apple-touch-icon.png

3. Download and save real placeholder images using 
   Unsplash source URLs for each image. Use fetch 
   to download these specific royalty-free images:

   Hero background (choir/worship):
   https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=1920&q=80
   Save as: public/images/hero-bg.jpg

   About page (choir group):
   https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&q=80
   Save as: public/images/about.jpg

   Young choristers program:
   https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80
   Save as: public/images/programs/young-choristers.jpg

   Worship leadership:
   https://images.unsplash.com/photo-1574169208507-84376144848b?w=800&q=80
   Save as: public/images/programs/worship-leadership.jpg

   Instrument training (piano):
   https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&q=80
   Save as: public/images/programs/instrument-training.jpg

   Equipment installation:
   https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80
   Save as: public/images/equipment/installation.jpg

   Piano:
   https://images.unsplash.com/photo-1552422535-c45813c61732?w=800&q=80
   Save as: public/images/equipment/piano.jpg

   Sound system:
   https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80
   Save as: public/images/equipment/sound-system.jpg

   Organ:
   https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&q=80
   Save as: public/images/equipment/organ.jpg

   Gallery rehearsal 1:
   https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=1200&q=80
   Save as: public/images/gallery/rehearsals/rehearsal-1.jpg

   Gallery rehearsal 2:
   https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80
   Save as: public/images/gallery/rehearsals/rehearsal-2.jpg

   Gallery rehearsal 3:
   https://images.unsplash.com/photo-1604881991720-f91add269bed?w=1200&q=80
   Save as: public/images/gallery/rehearsals/rehearsal-3.jpg

   Gallery event 1:
   https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=80
   Save as: public/images/gallery/events/event-1.jpg

   Gallery event 2:
   https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&q=80
   Save as: public/images/gallery/events/event-2.jpg

   Installation 1:
   https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=1200&q=80
   Save as: public/images/gallery/installations/install-1.jpg

   Installation 2:
   https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&q=80
   Save as: public/images/gallery/installations/install-2.jpg

   Team placeholder:
   https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&q=80
   Save as: public/images/team/placeholder.jpg

4. Generate a favicon.ico and apple-touch-icon.png 
   using a simple purple circle with gold "A" letter:
   - Create public/favicon.ico (32x32)
   - Create public/apple-touch-icon.png (180x180)

5. Update src/components/layout/Logo.tsx:
   - Use next/image to load /images/logo.png
   - Add onError handler to fall back to text logo 
     if image not found
   - variant="dark" → add brightness-0 invert class
   - variant="light" → original colors
   - showTagline prop shows tagline below logo
   - Keep the Link wrapper and aria-label

6. Update these components to use the downloaded images:

   src/components/sections/HeroSection.tsx:
   - Add background image using next/image with 
     fill prop behind the gradient overlay
   - Use /images/hero-bg.jpg
   - Keep all existing animations and content

   src/components/sections/AboutPreview.tsx:
   - Replace image placeholder with next/image
   - Use /images/about.jpg
   - Maintain existing layout

   src/components/sections/ProgramsPreview.tsx:
   - Use program images for each program card
   - young-choristers.jpg, worship-leadership.jpg,
     instrument-training.jpg

   src/components/sections/GalleryPreview.tsx:
   - Use the 6 gallery images downloaded above
   - Mix of rehearsals and events images

   src/components/sections/EquipmentPreview.tsx:
   - Use equipment images
   - piano.jpg, sound-system.jpg, installation.jpg

7. Update src/app/[locale]/layout.tsx metadata:
   icons: {
     icon: '/favicon.ico',
     apple: '/apple-touch-icon.png',
   }

8. Update next.config.js/ts to allow Unsplash images 
   in case any are loaded remotely:
   images: {
     remotePatterns: [
       { protocol: 'https', hostname: 'images.unsplash.com' },
       { protocol: 'https', hostname: '*.supabase.co' },
     ]
   }

After completing all steps:
- Run npm run typecheck and fix all TypeScript errors
- Run npm run build and fix all build errors
- Show the complete public/images/ folder structure