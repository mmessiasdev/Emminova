import { ContactHero } from '@landing/components/landing/ContactHero';
import { ContactForm } from '@landing/components/landing/ContactForm';
import { PublicLayout } from '@landing/components/layout/PublicLayout';

const ContactPage = () => {
    return (
        <PublicLayout>
            <ContactHero />
            <div className="max-w-4xl mx-auto px-6 pb-32">
                <ContactForm />
            </div>
        </PublicLayout>
    );
};

export default ContactPage;
