// @ts-nocheck
import { auth, allow } from "@instantdb/react";

const perms = {
  rules: {
    memes: {
      // Users can read all public memes or their own memes
      read: allow.if(
        auth.id !== null,
        (ctx) => ctx.data.isPublic === true || ctx.data.userId === ctx.auth.id
      ),
      // Users can create memes
      create: allow.if(auth.id !== null),
      // Users can only update their own memes
      update: allow.if(
        auth.id !== null,
        (ctx) => ctx.data.userId === ctx.auth.id
      ),
      // Users can only delete their own memes
      delete: allow.if(
        auth.id !== null,
        (ctx) => ctx.data.userId === ctx.auth.id
      ),
    },
    upvotes: {
      // Users can read all upvotes
      read: allow.if(auth.id !== null),
      // Users can create upvotes
      create: allow.if(auth.id !== null),
      // Users can only delete their own upvotes
      delete: allow.if(
        auth.id !== null,
        (ctx) => ctx.data.userId === ctx.auth.id
      ),
    },
    templates: {
      // Everyone can read templates
      read: allow.if(true),
      // Only admins can create/update/delete templates (for now, allow all authenticated users)
      create: allow.if(auth.id !== null),
      update: allow.if(auth.id !== null),
      delete: allow.if(auth.id !== null),
    },
  },
};

export default perms;
