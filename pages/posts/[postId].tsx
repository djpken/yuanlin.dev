import Post, { parsePost } from '../../models/post';
import isUserAgentBrowser from '../../utils/isUserAgentBrowser';
import getPost from '../../services/getPost';
import PageHead from '../../components/PageHead';
import { useEffect, useState } from 'react';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';
import { NextPageContext } from 'next';

export default function (props: { postId: string, post?: Post }) {
  const { postId } = props;
  const [mdxSource, setMdxSource] = useState<any>(null);
  const [post, setPost] = useState<Post | undefined>(parsePost(props.post));

  async function refresh() {
    if (!postId) return;
    try {
      const res = await fetch('/api/posts/' + postId);
      const data = await res.json();
      data.createdAt = new Date(data.createdAt);
      setPost(data);
      const mdxSource = await serialize(data.content);
      setMdxSource(mdxSource);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    (async () => {
      await refresh();
    })();
  }, []);

  return (
    <div>
      <PageHead
        title={(post ? post.title : 'Blog') + '| Yuanlin Lin 林沅霖'}
        type="article"
        imageUrl={`/api/og_image?url=/posts/${postId}`}
        description={post?.content.substring(0, 100) + '...'}
      />
      <div
        className="w-full lg:h-[46rem] h-[36rem] overflow-hidden
         relative flex justify-center">
        <img
          src={post?.coverImageUrl}
          className="absolute top-0 w-full h-full object-cover bg-zinc-500"
          alt="" />
        <div
          className="w-full h-full absolute top-0 right-0
         bg-black bg-opacity-60" />
        <div
          className="w-full px-4
         lg:w-[650px] mx-auto absolute lg:bottom-24 bottom-12">

          {!post ? <TitleSkeleton /> : <p
            className="text-white text-3xl lg:text-5xl font-extrabold"
            style={{ lineHeight: 1.5 }}>
            {post?.title}
          </p>}

          {!post ? <AuthorSkeleton /> : <div
            className="flex flex-row align-bottom mt-4">
            <img
              src="https://avatars.githubusercontent.com/u/21105863"
              className="rounded-full h-8 w-8 mr-4"
              alt="" />
            <p
              className="text-white lg:text-xl
             font-extrabold opacity-80">
              Yuanlin Lin 林沅霖
            </p>
            <p className="text-white lg:text-xl ml-2 lg:ml-8 opacity-60">
              {post?.createdAt.toISOString().split('T')[0]}
            </p>
          </div>}

        </div>
      </div>
      <div className="w-full lg:w-[650px] px-4 mx-auto min-h-screen">
        <div id="article" className="mt-16 mb-32">
          {!post && <ArticleSkeleton />}
          {mdxSource && <MDXRemote {...mdxSource} components={{}} />}
        </div>
      </div>
    </div>
  );
};

function AuthorSkeleton() {
  return <div className="flex flex-row align-bottom mt-8 items-center">
    <div className="rounded-full h-8 w-8 mr-4 animate-pulse bg-zinc-500" />
    <div className="bg-zinc-600 w-64 mr-4 animate-pulse h-6 rounded-lg" />
    <div className="bg-zinc-700 w-36 animate-pulse h-6 rounded-lg" />
  </div>;
}

function TitleSkeleton() {
  return <div>
    <div className="bg-zinc-600 animate-pulse w-full h-8 lg:h-14 rounded-xl" />
    <div
      className="bg-zinc-600 mt-4 animate-pulse
    w-1/2 h-8 lg:h-14 rounded-xl" />
  </div>;
}

function ArticleSkeleton() {
  return <div>
    <div className="bg-zinc-200 animate-pulse w-full h-4 rounded-lg" />
    <div className="bg-zinc-200 mt-4 animate-pulse w-1/2 h-4 rounded-lg" />
    <div className="bg-zinc-200 mt-4 animate-pulse w-1/3 h-4 rounded-lg" />
    <div className="bg-zinc-200 mt-4 animate-pulse w-full h-4 rounded-lg" />
    <div className="bg-zinc-200 mt-4 animate-pulse w-1/4 h-4 rounded-lg" />
    <div className="bg-zinc-300 animate-pulse w-full h-8 my-16 rounded-lg" />
    <div className="bg-zinc-200 animate-pulse w-full h-4 rounded-lg" />
    <div className="bg-zinc-200 mt-4 animate-pulse w-1/2 h-4 rounded-lg" />
    <div className="bg-zinc-200 mt-4 animate-pulse w-1/3 h-4 rounded-lg" />
    <div className="bg-zinc-200 mt-4 animate-pulse w-full h-4 rounded-lg" />
    <div className="bg-zinc-200 mt-4 animate-pulse w-1/4 h-4 rounded-lg" />
  </div>;
}

export async function getServerSideProps(context: NextPageContext) {
  const ua = context.req?.headers['user-agent'];
  if (isUserAgentBrowser(ua))
    return { props: { postId: context.query.postId } };
  const postId = context.query.postId;
  if (typeof postId !== 'string')
    return { props: { error: 'Post not found.' } };
  try {
    const post = await getPost(postId);
    return { props: { postId, post } };
  } catch (error) {
    return { props: { error } };
  }
}
