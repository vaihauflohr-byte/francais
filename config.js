// =====================================================================
//  Français au collège — configuration du site
//  La clé ci-dessous est la clé PUBLIQUE (publishable) de Supabase : elle peut être publique.
//  Elle ne donne accès qu'aux fonctions prévues pour les élèves (schéma « fr »).
//  Laisse supabaseUrl vide pour le MODE DÉMO (tout reste dans ce navigateur, pour tester).
// =====================================================================
window.FR_CONFIG = {
  supabaseUrl: "https://zhxbjarkimttlmfvvcyb.supabase.co",
  supabaseCle: "sb_publishable_5z3o1duIU-0bJpGTyiLyaw_vZsXXF7U",
  schema: "fr",
  iaFonction: "corriger-francais",
  // clé publique « anon » (ancien format, publique elle aussi) : la passerelle de la fonction IA vérifie un JWT
  iaJeton: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoeGJqYXJraW10dGxtZnZ2Y3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NDU5ODksImV4cCI6MjEwNjMyMTk4OX0.Z4h8imUMYOtDnuXJY__4naEwDX7NepuUnVfN0qKuxlg",
  siteUrl: "https://francais.ka-ilei.com",
  college: "Collège Tinomana Ebb de Teva I Uta",
  signature: "Mme FLOHR - Collège Tinomana EBB de Teva I Uta"
};
