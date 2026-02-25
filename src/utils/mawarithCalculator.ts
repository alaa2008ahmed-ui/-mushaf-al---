interface HeirResult {
    name: string;
    share: number; // Fractional share (e.g., 1/2, 1/4)
    amount: number;
    type: 'فرض' | 'تعصيب' | 'رد';
}

interface MawarithInput {
    estateValue: string;
    hasFather: boolean;
    hasMother: boolean;
    spouseType: 'none' | 'husband' | 'wife';
    wivesCount: number;
    sonsCount: number;
    daughtersCount: number;
    hasPaternalGrandfather: boolean;
    hasMaternalGrandmother: boolean;
    brothersCount: number;
    sistersCount: number;
    paternalUnclesCount: number;
    paternalAuntsCount: number;
    maternalUnclesCount: number;
    maternalAuntsCount: number;
}

export const calculateMawarith = (input: MawarithInput): HeirResult[] => {
    const total = parseFloat(input.estateValue) || 0;
    if (total <= 0) return [];

    let remaining = total;
    const results: HeirResult[] = [];
    const hasSons = input.sonsCount > 0;
    const hasDaughters = input.daughtersCount > 0;
    const isChildrenPresent = hasSons || hasDaughters;

    // --- Step 1: Determine who is present and apply basic exclusions ---
    const isFatherPresent = input.hasFather;
    const isMotherPresent = input.hasMother;
    const isPaternalGrandfatherPresent = input.hasPaternalGrandfather && !isFatherPresent; // Grandfather is excluded by father
    const isMaternalGrandmotherPresent = input.hasMaternalGrandmother && !isMotherPresent; // Grandmother is excluded by mother

    // Siblings are excluded by sons, father, and paternal grandfather
    const isSiblingsExcluded = hasSons || isFatherPresent || isPaternalGrandfatherPresent;
    const isBrothersPresent = input.brothersCount > 0 && !isSiblingsExcluded;
    const isSistersPresent = input.sistersCount > 0 && !isSiblingsExcluded;

    // Uncles are excluded by sons, father, paternal grandfather, and brothers
    const isPaternalUnclesPresent = input.paternalUnclesCount > 0 && !isSiblingsExcluded && !isBrothersPresent && !isSistersPresent;
    // Paternal aunts, maternal uncles/aunts are generally Dhawu al-Arham and don't inherit in this simplified model

    // --- Step 2: Assign Furood (Fixed Shares) ---

    // Spouse
    if (input.spouseType === 'husband') {
        const share = isChildrenPresent ? 1/4 : 1/2;
        const amount = total * share;
        results.push({ name: 'الزوج', share, amount, type: 'فرض' });
        remaining -= amount;
    } else if (input.spouseType === 'wife' && input.wivesCount > 0) {
        const share = isChildrenPresent ? 1/8 : 1/4;
        const amount = total * share;
        results.push({ name: input.wivesCount > 1 ? `الزوجات (${input.wivesCount})` : 'الزوجة', share, amount, type: 'فرض' });
        remaining -= amount;
    }

    // Mother
    if (isMotherPresent) {
        const share = isChildrenPresent || (input.brothersCount + input.sistersCount >= 2 && !isSiblingsExcluded) ? 1/6 : 1/3; // Mother's share changes with children or multiple siblings
        const amount = total * share;
        results.push({ name: 'الأم', share, amount, type: 'فرض' });
        remaining -= amount;
    }

    // Paternal Grandmother
    if (isMaternalGrandmotherPresent) {
        const share = 1/6;
        const amount = total * share;
        results.push({ name: 'الجدة لأم', share, amount, type: 'فرض' });
        remaining -= amount;
    }

    // Daughters (if no sons)
    if (!hasSons && hasDaughters) {
        const share = input.daughtersCount === 1 ? 1/2 : 2/3;
        const amount = Math.min(total * share, remaining);
        results.push({ name: input.daughtersCount === 1 ? 'البنت' : `البنات (${input.daughtersCount})`, share, amount, type: 'فرض' });
        remaining -= amount;
    }

    // --- Step 3: Assign Ta'seeb (Residuary Shares) ---

    // Father (as residuary if no children, or with fixed share + residuary)
    if (isFatherPresent) {
        let fatherShare = 0;
        if (isChildrenPresent) {
            fatherShare = 1/6; // Fixed share with children
            const amount = total * fatherShare;
            results.push({ name: 'الأب (فرض)', share: fatherShare, amount, type: 'فرض' });
            remaining -= amount;
        }
        // Father takes remaining as Ta'seeb if no sons or no children at all
        if (!hasSons && remaining > 0) {
            results.push({ name: 'الأب (تعصيباً)', share: remaining/total, amount: remaining, type: 'تعصيب' });
            remaining = 0;
        }
    }

    // Paternal Grandfather (as residuary if no father and no children, or with fixed share + residuary)
    if (isPaternalGrandfatherPresent) {
        let grandfatherShare = 0;
        if (isChildrenPresent) {
            grandfatherShare = 1/6; // Fixed share with children
            const amount = total * grandfatherShare;
            results.push({ name: 'الجد لأب (فرض)', share: grandfatherShare, amount, type: 'فرض' });
            remaining -= amount;
        }
        // Grandfather takes remaining as Ta'seeb if no sons and no father
        if (!hasSons && !isFatherPresent && remaining > 0) {
            results.push({ name: 'الجد لأب (تعصيباً)', share: remaining/total, amount: remaining, type: 'تعصيب' });
            remaining = 0;
        }
    }

    // Sons and Daughters (Ta'seeb)
    if (hasSons) {
        const totalParts = (input.sonsCount * 2) + input.daughtersCount;
        const partValue = remaining / totalParts;
        
        if (input.sonsCount > 0) {
            results.push({ name: input.sonsCount === 1 ? 'الابن' : `الأبناء (${input.sonsCount})`, share: (partValue * 2 * input.sonsCount)/total, amount: partValue * 2 * input.sonsCount, type: 'تعصيب' });
        }
        if (input.daughtersCount > 0) {
            results.push({ name: input.daughtersCount === 1 ? 'البنت' : `البنات (${input.daughtersCount})`, share: (partValue * input.daughtersCount)/total, amount: partValue * input.daughtersCount, type: 'تعصيب' });
        }
        remaining = 0; // Children take all remaining
    }

    // Siblings (Ta'seeb if no sons, father, paternal grandfather)
    if (!isSiblingsExcluded && (isBrothersPresent || isSistersPresent) && remaining > 0) {
        const totalSiblingParts = (input.brothersCount * 2) + input.sistersCount; // Assuming full/paternal siblings
        if (totalSiblingParts > 0) {
            const partValue = remaining / totalSiblingParts;
            if (input.brothersCount > 0) {
                results.push({ name: input.brothersCount === 1 ? 'الأخ' : `الإخوة (${input.brothersCount})`, share: (partValue * 2 * input.brothersCount)/total, amount: partValue * 2 * input.brothersCount, type: 'تعصيب' });
            }
            if (input.sistersCount > 0) {
                results.push({ name: input.sistersCount === 1 ? 'الأخت' : `الأخوات (${input.sistersCount})`, share: (partValue * input.sistersCount)/total, amount: partValue * input.sistersCount, type: 'تعصيب' });
            }
            remaining = 0;
        } else if (input.sistersCount > 0 && !isBrothersPresent) { // Only sisters, as Fard if no brothers
            const share = input.sistersCount === 1 ? 1/2 : 2/3;
            const amount = Math.min(total * share, remaining);
            results.push({ name: input.sistersCount === 1 ? 'الأخت' : `الأخوات (${input.sistersCount})`, share, amount, type: 'فرض' });
            remaining -= amount;
        }
    }

    // Paternal Uncles (Ta'seeb if no closer residuaries)
    if (isPaternalUnclesPresent && remaining > 0) {
        results.push({ name: input.paternalUnclesCount === 1 ? 'العم' : `الأعمام (${input.paternalUnclesCount})`, share: remaining/total, amount: remaining, type: 'تعصيب' });
        remaining = 0;
    }

    // Final check for remaining (e.g., for رد - return to heirs by proportion)
    // This is a simplification, full رد logic is complex.
    if (remaining > 0) {
        const furoodHeirs = results.filter(r => r.type === 'فرض');
        if (furoodHeirs.length > 0) {
            const totalFuroodShares = furoodHeirs.reduce((sum, heir) => sum + heir.share, 0);
            if (totalFuroodShares > 0) {
                furoodHeirs.forEach(heir => {
                    const additionalAmount = (heir.share / totalFuroodShares) * remaining;
                    heir.amount += additionalAmount;
                    heir.share += additionalAmount / total;
                    heir.type = 'رد'; // Mark as returned
                });
                remaining = 0;
            }
        }
    }

    return results;
};
