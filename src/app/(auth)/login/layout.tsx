import React from "react";

type Props = {
  children: React.ReactNode;
};

const layout = (props: Props) => {
  const tien11 = process.env.NEXTAUTH_URL;
  const p2 = process.env.NEXTAUTH_SECRET;
  return (
    <>
      <p>{tien11}</p>
      <p>{p2}</p>
      {props.children}
    </>
  );
};

export default layout;
