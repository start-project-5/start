import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>("GOOGLE_CLIENT_ID")!,
      clientSecret: configService.get<string>("GOOGLE_CLIENT_SECRET")!,
      callbackURL: configService.get<string>("GOOGLE_CALLBACKURL")!,
      scope: ["email", "profile"],
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { emails, name, photos, provider, id } = profile;

      const user = {
        email: emails[0].value,
        accessToken,
        profile: {
          firstName: name.givenName,
          lastName: name.familyName,
          avatarUrl: photos[0]?.value || "",
        },

        socialAccounts: [
          {
            provider: provider,
            externalId: id, // Yoki Google bergan unique ID
          },
        ],
      };

      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}
