from django.core.management.base import BaseCommand

from packages.club_utils import DEFAULT_CLUBS, ensure_default_clubs, find_club_by_name


class Command(BaseCommand):
    help = "Create or update the 3 default Faydo clubs from the PDF specification"

    def handle(self, *args, **options):
        clubs, created_count = ensure_default_clubs()
        print(f"Ensured {len(clubs)} clubs ({created_count} newly created).")
        for data in DEFAULT_CLUBS:
            club = find_club_by_name(data["name"])
            if club:
                print(f"  club id={club.pk} name={data['name'].encode('unicode_escape').decode()}")
