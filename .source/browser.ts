// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"authors.mdx": () => import("../content/docs/authors.mdx?collection=docs"), "categories.mdx": () => import("../content/docs/categories.mdx?collection=docs"), "getting-started.mdx": () => import("../content/docs/getting-started.mdx?collection=docs"), "index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "posts.mdx": () => import("../content/docs/posts.mdx?collection=docs"), "response-shapes.mdx": () => import("../content/docs/response-shapes.mdx?collection=docs"), "stats.mdx": () => import("../content/docs/stats.mdx?collection=docs"), "tags.mdx": () => import("../content/docs/tags.mdx?collection=docs"), "troubleshooting.mdx": () => import("../content/docs/troubleshooting.mdx?collection=docs"), "versioning.mdx": () => import("../content/docs/versioning.mdx?collection=docs"), }),
};
export default browserCollections;