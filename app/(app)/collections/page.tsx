import React from "react";

import { getCollections } from "@/lib/typesense/actions/get-collections";

import TypesenseCollections from "@/components/TypesenseCollections";

export default async function page() {
  const collections = await getCollections();

  return <TypesenseCollections collections={collections} />;
}
