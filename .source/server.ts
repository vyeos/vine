// @ts-nocheck
import * as __fd_glob_9 from "../content/docs/versioning.mdx?collection=docs"
import * as __fd_glob_8 from "../content/docs/troubleshooting.mdx?collection=docs"
import * as __fd_glob_7 from "../content/docs/tags.mdx?collection=docs"
import * as __fd_glob_6 from "../content/docs/stats.mdx?collection=docs"
import * as __fd_glob_5 from "../content/docs/response-shapes.mdx?collection=docs"
import * as __fd_glob_4 from "../content/docs/posts.mdx?collection=docs"
import * as __fd_glob_3 from "../content/docs/index.mdx?collection=docs"
import * as __fd_glob_2 from "../content/docs/getting-started.mdx?collection=docs"
import * as __fd_glob_1 from "../content/docs/categories.mdx?collection=docs"
import * as __fd_glob_0 from "../content/docs/authors.mdx?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "content/docs", {}, {"authors.mdx": __fd_glob_0, "categories.mdx": __fd_glob_1, "getting-started.mdx": __fd_glob_2, "index.mdx": __fd_glob_3, "posts.mdx": __fd_glob_4, "response-shapes.mdx": __fd_glob_5, "stats.mdx": __fd_glob_6, "tags.mdx": __fd_glob_7, "troubleshooting.mdx": __fd_glob_8, "versioning.mdx": __fd_glob_9, });