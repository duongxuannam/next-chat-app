import React from "react";

type Props = {
  children: React.ReactNode;
};

const layout = (props: Props) => {
  console.log("process.env.NEXTAUTH_URL", process.env.NEXTAUTH_URL);
  const tien11 = process.env.NEXTAUTH_URL;
  const p2 = process.env.GOOGLE_CLIENT_ID;
  return (
    <>
      <p>{tien11}</p>
      <p>{p2}</p>
      {props.children}
    </>
  );
};

export default layout;
