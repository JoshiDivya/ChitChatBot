import Head from "next/head";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import { use } from "react";
import { getSession } from "@auth0/nextjs-auth0";

export default function Home() {
  const { isLoading, error, user } = useUser();
  if (isLoading) return <p>loading...</p>;
  if (error) return <p>{error.message}</p>;

  return (
    <>
      <Head>
        <title>Chit ChatBox-Login or Logout</title>
      </Head>
      <div className="flex justify-center items-center min-h-screen w-full bg-gray-600 text-white text-center">
        <div>
          {!!user && <Link href="api/auth/logout">Signout</Link>}
          {!user && <> <Link href="api/auth/signup"  className="btn">Signup</Link>
          <Link href="api/auth/login"  className="btn">Login</Link></>}
        </div>
      </div>
    </>
  );
}


export const getServerSideProps = async(ctx)=>{
  const session = await getSession(ctx.req, ctx.res);
  if(!!session){
    return {
      redirect :{
        destination:"/chat"
      }
    }
  }
  return {
    props:{}
  }

}
