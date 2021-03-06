import { GetServerSideProps } from "next";
export { NextRouteComponent as default } from "@pankod/refine-nextjs-router";
import { checkAuthentication } from "@pankod/refine-nextjs-router";
import { DataProvider } from "@pankod/refine-strapi-v4";

import nookies from "nookies";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { API_URL, TOKEN_KEY } from "src/constants";
import { authProvider, axiosInstance } from "src/authProvider";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { isAuthenticated, ...props } = await checkAuthentication(
    authProvider,
    context
  );

  const i18nProps = await serverSideTranslations(context.locale ?? "en", [
    "common",
  ]);
  if (!isAuthenticated) {
    return { props: { ...props, ...i18nProps } };
  }
  const { query } = context;
  try {
    const cookies = nookies.get(context);
    if (cookies[TOKEN_KEY]) {
      axiosInstance.defaults.headers = {
        Authorization: `Bearer ${cookies[TOKEN_KEY]}`,
      };
    }
    const data = await DataProvider(API_URL + "/api", axiosInstance).getList({
      resource: query["resource"] as string,
    });
    return {
      props: {
        initialData: data,
        ...i18nProps,
      },
    };
  } catch (error) {
    return {
      props: {
        ...i18nProps,
      },
    };
  }
};
