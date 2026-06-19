import { useState } from "react";
import Link from "next/link";
import useSWR, { mutate } from "swr";
import { Plus } from "lucide-react";

import { Button } from "@plane/propel/button";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import { EModalPosition, EModalWidth, Input, ModalCore } from "@plane/ui";

import { AuthenticationWrapper } from "@/lib/wrappers/authentication-wrapper";
import companyService from "@/services/company.service";
import type { TCompany } from "@/services/company.service";

const COMPANIES_KEY = "/api/companies/";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

type CreateCompanyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (company: TCompany) => void;
};

function CreateCompanyModal({ isOpen, onClose, onCreated }: CreateCompanyModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    if (submitting) return;
    setName("");
    setSlug("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setToast({ type: TOAST_TYPE.ERROR, title: "Name required", message: "Company name cannot be empty" });
      return;
    }
    setSubmitting(true);
    try {
      const company = await companyService.create({
        name: trimmedName,
        slug: slug.trim() || undefined,
      });
      setToast({ type: TOAST_TYPE.SUCCESS, title: "Company created", message: company.name });
      onCreated(company);
      handleClose();
    } catch (err: any) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Could not create company",
        message: err?.error || err?.slug || "Try a different name or slug",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalCore isOpen={isOpen} handleClose={handleClose} position={EModalPosition.CENTER} width={EModalWidth.LG}>
      <form onSubmit={handleSubmit} className="space-y-5 p-5">
        <h3 className="text-18 font-medium text-primary">Create a new company</h3>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="company-name-input" className="text-13 text-secondary">
              Company name
            </label>
            <Input
              id="company-name-input"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slug) setSlug(slugify(e.target.value));
              }}
              placeholder="Acme Inc."
              required
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="company-slug-input" className="text-13 text-secondary">
              Slug
            </label>
            <Input
              id="company-slug-input"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="acme"
            />
            <p className="text-11 text-tertiary">Used in URLs. Auto-generated from the name.</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" size="base" onClick={handleClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" size="base" type="submit" loading={submitting}>
            {submitting ? "Creating…" : "Create company"}
          </Button>
        </div>
      </form>
    </ModalCore>
  );
}

export default function CompaniesPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data: companies, isLoading } = useSWR<TCompany[]>(COMPANIES_KEY, () => companyService.list());

  const handleCreated = (company: TCompany) => {
    mutate(COMPANIES_KEY, (prev: TCompany[] | undefined) => (prev ? [company, ...prev] : [company]), false);
  };

  return (
    <AuthenticationWrapper>
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-6 px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-24 font-semibold text-primary">Your companies</h1>
            <p className="text-13 text-secondary">Each company owns its own workspaces, members, and projects.</p>
          </div>
          <Button variant="primary" size="base" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            New company
          </Button>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-subtle bg-layer-1 p-8 text-center text-13 text-tertiary">
            Loading companies…
          </div>
        ) : !companies || companies.length === 0 ? (
          <div className="rounded-lg border border-subtle bg-layer-1 p-8 text-center">
            <p className="text-15 font-medium text-primary">No companies yet</p>
            <p className="mt-1 text-13 text-secondary">Create a company to start organising workspaces.</p>
            <Button variant="primary" size="base" className="mt-4" onClick={() => setCreateOpen(true)}>
              Create your first company
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {companies.map((c) => (
              <Link
                key={c.id}
                href={`/companies/${c.slug}`}
                className="rounded-lg border border-subtle bg-layer-1 p-4 transition hover:border-strong"
              >
                <div className="text-15 font-medium text-primary">{c.name}</div>
                <div className="text-11 text-tertiary">@{c.slug}</div>
                {c.description ? <p className="mt-2 line-clamp-2 text-13 text-secondary">{c.description}</p> : null}
                <div className="mt-3 flex items-center gap-3 text-11 text-tertiary">
                  <span>
                    {c.workspace_count} workspace{c.workspace_count === 1 ? "" : "s"}
                  </span>
                  <span>·</span>
                  <span>
                    {c.member_count} member{c.member_count === 1 ? "" : "s"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <CreateCompanyModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onCreated={handleCreated} />
      </div>
    </AuthenticationWrapper>
  );
}
