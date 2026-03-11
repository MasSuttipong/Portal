"use client";

import { useState, useEffect } from "react";
import type { Company, PortalSettings } from "@/types/portal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { buildIClaimUrl } from "@/lib/iclaim";

interface IClaimModalProps {
  open: boolean;
  onClose: () => void;
  company: Company | null;
  settings: PortalSettings["iclaim"];
}

type Step = "confirm" | "claimType";

export default function IClaimModal({
  open,
  onClose,
  company,
  settings,
}: IClaimModalProps) {
  const [step, setStep] = useState<Step>("confirm");

  // Reset to first step whenever the modal opens for a new company
  useEffect(() => {
    if (open) {
      setStep("confirm");
    }
  }, [open, company?.id]);

  function handleConfirm() {
    if (!company) return;
    const { claimType } = company;

    if (claimType === "OPD_ONLY") {
      // Skip claim type selection — go straight to OPD
      redirect("OPD");
    } else if (claimType === "IPD_ONLY") {
      redirect("IPD");
    } else {
      setStep("claimType");
    }
  }

  function redirect(type: "OPD" | "IPD") {
    if (!company || !company.code || !company.iclaimId) return;
    const url = buildIClaimUrl(settings.baseUrl, company.code, company.iclaimId, type);
    window.location.href = url;
  }

  function handleClose() {
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent showCloseButton={true} className="sm:max-w-md border-t-4 border-t-portal-gold">
        {step === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-base font-semibold text-primary font-heading">
                {company?.displayName}
              </DialogTitle>
            </DialogHeader>

            <p className="text-foreground/80 leading-relaxed py-2">
              {settings.confirmText}
            </p>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                {settings.confirmCancel}
              </Button>
              <Button
                onClick={handleConfirm}
                className="bg-portal-cta hover:bg-portal-cta-hover text-white"
              >
                {settings.confirmOk}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "claimType" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-base font-semibold text-primary font-heading">
                {settings.claimTypePrompt}
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-3 py-4">
              {company?.claimType !== "IPD_ONLY" && (
                <button
                  type="button"
                  onClick={() => redirect("OPD")}
                  className="w-full py-4 text-lg font-semibold font-heading rounded-lg bg-portal-cta hover:bg-portal-cta-hover hover:shadow-lg text-white transition-all duration-200 cursor-pointer"
                >
                  OPD
                  <span className="block text-sm font-normal opacity-90 mt-0.5">
                    ผู้ป่วยนอก
                  </span>
                </button>
              )}
              {company?.claimType !== "OPD_ONLY" && (
                <button
                  type="button"
                  onClick={() => redirect("IPD")}
                  className="w-full py-4 text-lg font-semibold font-heading rounded-lg bg-portal-success hover:bg-portal-success-hover hover:shadow-lg text-white transition-all duration-200 cursor-pointer"
                >
                  IPD
                  <span className="block text-sm font-normal opacity-90 mt-0.5">
                    ผู้ป่วยใน
                  </span>
                </button>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("confirm")}>
                ย้อนกลับ
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
