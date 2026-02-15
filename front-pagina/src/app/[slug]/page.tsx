import { getOrganizationInfo, getRoomTypes } from "@/lib/api";
import { resolveTemplateKey } from "@/lib/theme-resolver";
import HeroEssential from "@/components/heroes/HeroEssential";
import HeroSignature from "@/components/heroes/HeroSignature";
import HeroPremium from "@/components/heroes/HeroPremium";
import BookingSearchBar from "@/components/BookingSearchBar";
import AboutSection from "@/components/sections/AboutSection";
import AmenitiesSection from "@/components/sections/AmenitiesSection";
import GallerySection from "@/components/sections/GallerySection";
import RoomsSection from "@/components/sections/RoomsSection";
import CTASection from "@/components/sections/CTASection";
import InfoSection from "@/components/sections/InfoSection";
import ExperienceSection from "@/components/sections/ExperienceSection";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LandingPage({ params }: Props) {
  const { slug } = await params;
  const [org, roomTypes] = await Promise.all([
    getOrganizationInfo(slug),
    getRoomTypes(slug),
  ]);

  const template = resolveTemplateKey(org.theme_template);

  // For single-property orgs, use the first property's data directly
  // For multi-property, this same page will show the first property for now
  // (multi-property landing with property cards can be added later)
  const property = org.properties[0];
  if (!property) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">No hay propiedades activas.</p>
      </div>
    );
  }

  // Shared section elements
  const about = property.description ? (
    <AboutSection key="about" description={property.description} photos={property.photos} propertyName={property.name} template={template} />
  ) : null;

  const rooms = (
    <RoomsSection
      key="rooms"
      roomTypes={roomTypes}
      currency={org.currency}
      template={template}
    />
  );

  const amenities = (
    <AmenitiesSection key="amenities" amenities={property.amenities} template={template} />
  );

  const gallery = (
    <GallerySection
      key="gallery"
      photos={property.photos}
      propertyName={property.name}
      template={template}
    />
  );

  const cta = <CTASection key="cta" template={template} />;

  const info = <InfoSection key="info" property={property} template={template} />;

  // Template-specific hero + section order
  if (template === "essential") {
    return (
      <div>
        <HeroEssential
          hotelName={property.name}
          city={property.city}
          tagline={property.tagline}
          heroImage={property.hero_image}
          stars={property.stars}
        />
        {about}
        {rooms}
        {amenities}
        {info}
        {cta}
      </div>
    );
  }

  if (template === "premium") {
    return (
      <div>
        <HeroPremium
          hotelName={property.name}
          city={property.city}
          tagline={property.tagline}
          heroImage={property.hero_image}
          photos={property.photos}
          stars={property.stars}
        />
        {/* Search bar overlapping hero bottom */}
        <div className="relative z-20 -mt-12">
          <BookingSearchBar />
        </div>
        {about}
        {rooms}
        {gallery}
        {amenities}
        {cta}
        {info}
      </div>
    );
  }

  // Default: signature
  return (
    <div>
      <HeroSignature
        hotelName={property.name}
        city={property.city}
        tagline={property.tagline}
        heroImage={property.hero_image}
        stars={property.stars}
        photos={property.photos}
      />
      {about}
      {rooms}
      {gallery}
      {amenities}
      {cta}
      {info}
    </div>
  );
}
