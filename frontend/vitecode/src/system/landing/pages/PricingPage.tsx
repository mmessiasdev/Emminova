import { PricingHero } from '@landing/components/landing/PricingHero';
import { PricingTiers } from '@landing/components/landing/PricingTiers';
import { PublicLayout } from '@landing/components/layout/PublicLayout';

const PricingPage = () => {
    return (
        <PublicLayout>
            <PricingHero />
            <PricingTiers />
        </PublicLayout>
    );
};

export default PricingPage;
