Caution

Deprecated
Create React App was one of the key tools for getting a React project up-and-running in 2017-2021, it is now in long-term stasis and we recommend that you migrate to one of React frameworks documented on Start a New React Project.

If you are following a tutorial to learn React, there is still value in continuing your tutorial, but we do not recommend starting production apps based on Create React App. reatct-scripts is no more active so please don't use in youe project any more please use exppress 



reating a React App
If you want to build a new app or website with React, we recommend starting with a framework.

If your app has constraints not well-served by existing frameworks, you prefer to build your own framework, or you just want to learn the basics of a React app, you can build a React app from scratch.

Full-stack frameworks 
These recommended frameworks support all the features you need to deploy and scale your app in production. They have integrated the latest React features and take advantage of React’s architecture.

Note
Full-stack frameworks do not require a server. 
All the frameworks on this page support client-side rendering (CSR), single-page apps (SPA), and static-site generation (SSG). These apps can be deployed to a CDN or static hosting service without a server. Additionally, these frameworks allow you to add server-side rendering on a per-route basis, when it makes sense for your use case.

This allows you to start with a client-only app, and if your needs change later, you can opt-in to using server features on individual routes without rewriting your app. See your framework’s documentation for configuring the rendering strategy.

Next.js (App Router) 
Next.js’s App Router is a React framework that takes full advantage of React’s architecture to enable full-stack React apps.

 Terminal
 Copy
npx create-next-app@latest
Next.js is maintained by Vercel. You can deploy a Next.js app to any hosting provider that supports Node.js or Docker containers, or to your own server. Next.js also supports static export which doesn’t require a server.

React Router (v7) 
React Router is the most popular routing library for React and can be paired with Vite to create a full-stack React framework. It emphasizes standard Web APIs and has several ready to deploy templates for various JavaScript runtimes and platforms.

To create a new React Router framework project, run:

 Terminal
 Copy
npx create-react-router@latest
React Router is maintained by Shopify.

Expo (for native apps) 
Expo is a React framework that lets you create universal Android, iOS, and web apps with truly native UIs. It provides an SDK for React Native that makes the native parts easier to use. To create a new Expo project, run:

 Terminal
 Copy
npx create-expo-app@latest
If you’re new to Expo, check out the Expo tutorial.

Expo is maintained by Expo (the company). Building apps with Expo is free, and you can submit them to the Google and Apple app stores without restrictions. Expo additionally provides opt-in paid cloud services.

Other frameworks 
There are other up-and-coming frameworks that are working towards our full stack React vision:

TanStack Start (Beta): TanStack Start is a full-stack React framework powered by TanStack Router. It provides a full-document SSR, streaming, server functions, bundling, and more using tools like Nitro and Vite.
RedwoodJS: Redwood is a full stack React framework with lots of pre-installed packages and configuration that makes it easy to build full-stack web applications.
Deep Dive
Which features make up the React team’s full-stack architecture vision? 

Show Details
Start From Scratch 
If your app has constraints not well-served by existing frameworks, you prefer to build your own framework, or you just want to learn the basics of a React app, there are other options available for starting a React project from scratch.

Starting from scratch gives you more flexibility, but does require that you make choices on which tools to use for routing, data fetching, and other common usage patterns.  It’s a lot like building your own framework, instead of using a framework that already exists. The frameworks we recommend have built-in solutions for these problems.

If you want to build your own solutions, see our guide to build a React app from Scratch for instructions on how to set up a new React project starting with a build tool like Vite, Parcel, or RSbuild.

If you’re a framework author interested in being included on this page, please let us know.