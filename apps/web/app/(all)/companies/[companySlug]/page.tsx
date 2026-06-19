import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { ArrowLeft, Plus } from "lucide-react";

import type { IWorkspace } from "@plane/types";

import { AuthenticationWrapper } from "@/lib/wrappers/authentication-wrapper";
import companyService from "@/services/company.service";
import type { TCompany } from "@/services/company.service";

export default function CompanyDetailPage() {
  const params = useParams();
  const companySlug = (params?.companySlug as string) || "";

  const { data: company, isLoading: companyLoading } = useSWR<TCompany>(
    companySlug ? `/api/companies/${companySlug}/` : null,
    () => companyService.retrieve(companySlug)
  );
  const { data: workspaces, isLoading: workspacesLoading } = useSWR<IWorkspace[]>(
    companySlug ? `/api/companies/${companySlug}/workspaces/` : null,
    () => companyService.workspaces(companySlug)
  );

  return (
    <AuthenticationWrapper>
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-6 px-6 py-10">
        <Link href="/companies" className="inline-flex items-center gap-1 text-12 text-secondary hover:text-primary">
          <ArrowLeft className="h-3.5 w-3.5" />
          Companies
        </Link>

        {companyLoading ? (
          <div className="rounded-lg border border-subtle bg-layer-1 p-8 text-center text-13 text-tertiary">
            Loading…
          </div>
        ) : !company ? (
          <div className="rounded-lg border border-subtle bg-layer-1 p-8 text-center text-13 text-tertiary">
            Company not found or you don't have access.
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-24 font-semibold text-primary">{company.name}</h1>
                <p className="text-13 text-secondary">@{company.slug}</p>
                {company.description ? (
                  <p className="mt-2 max-w-xl text-13 text-secondary">{company.description}</p>
                ) : null}
              </div>
              <Link
                href={`/create-workspace?company=${encodeURIComponent(company.slug)}`}
                className="hover:bg-accent-strong inline-flex items-center gap-1 rounded-md bg-accent-primary px-3 py-1.5 text-13 font-medium text-on-color"
              >
                <Plus className="h-4 w-4" />
                New workspace
              </Link>
            </div>

            <div className="space-y-2">
              <h2 className="text-15 font-medium text-primary">Workspaces</h2>
              {workspacesLoading ? (
                <div className="rounded-lg border border-subtle bg-layer-1 p-6 text-center text-13 text-tertiary">
                  Loading workspaces…
                </div>
              ) : !workspaces || workspaces.length === 0 ? (
                <div className="rounded-lg border border-subtle bg-layer-1 p-6 text-center">
                  <p className="text-13 text-secondary">No workspaces inside this company yet.</p>
                  <Link
                    href={`/create-workspace?company=${encodeURIComponent(company.slug)}`}
                    className="mt-3 inline-flex items-center gap-1 text-13 text-accent-primary hover:underline"
                  >
                    <Plus className="h-4 w-4" />
                    Create the first workspace
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {workspaces.map((w) => (
                    <Link
                      key={w.id}
                      href={`/${w.slug}`}
                      className="rounded-lg border border-subtle bg-layer-1 p-4 transition hover:border-strong"
                    >
                      <div className="text-15 font-medium text-primary">{w.name}</div>
                      <div className="text-11 text-tertiary">@{w.slug}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AuthenticationWrapper>
  );
}
