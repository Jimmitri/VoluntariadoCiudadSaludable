import { useEffect, useState } from "react";
import VolunteerLayout from "../components/VolunteerLayout";

import { auth, db, storage } from "../firebase/config";

import {
    doc,
    getDoc,
    updateDoc,
} from "firebase/firestore";

import {
    ref,
    uploadBytes,
    getDownloadURL,
} from "firebase/storage";

import {
    updateProfile,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
} from "firebase/auth";

function VolunteerProfile() {

    const [profile, setProfile] = useState(null);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [uploading, setUploading] = useState(false);

    const [changingPassword, setChangingPassword] = useState(false);

    const [previewImage, setPreviewImage] = useState(null);

    const [message, setMessage] = useState("");

    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {

        try {

            const user = auth.currentUser;

            if (!user) return;

            const userRef = doc(db, "users", user.uid);

            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {

                const data = userSnap.data();

                setProfile({

                    nombre: data.nombre || "",

                    email: data.email || user.email,

                    phone: data.telefono || "",

                    distrito: data.distrito || "",

                    fechaNacimiento: data.fechaNacimiento || "",

                    gender: data.gender || "",

                    photoURL:
                        data.photoURL ||
                        user.photoURL ||
                        "",

                    role:
                        data.role ||
                        "Volunteer",

                });

            } else {

                setProfile({

                    nombre:
                        user.displayName || "",

                    email:
                        user.email || "",

                    phone: "",

                    distrito: "",

                    fechaNacimiento: "",

                    gender: "",

                    photoURL:
                        user.photoURL || "",

                    role:
                        "Volunteer",

                });

            }

        } catch (error) {

            console.error(error);

        }

        setLoading(false);

    };

    const handleSave = async () => {

        try {

            setSaving(true);

            setMessage("");

            const user = auth.currentUser;

            if (!user) return;

            await updateDoc(
                doc(db, "users", user.uid),
                {

                    nombre: profile.nombre,

                    telefono: profile.phone,

                    distrito: profile.distrito,

                    fechaNacimiento: profile.fechaNacimiento,

                    gender: profile.gender,

                }
            );

            await updateProfile(user, {

                displayName: profile.nombre,

            });

            setMessage(
                "Perfil actualizado correctamente."
            );

        } catch (error) {

            console.error(error);

            setMessage(
                "Error al actualizar el perfil."
            );

        }

        setSaving(false);

    };

        const handleImageChange = async (e) => {

        const file = e.target.files[0];

        if (!file) return;

        try {

            setUploading(true);

            setMessage("");

            const user = auth.currentUser;

            const storageRef = ref(
                storage,
                `profile-images/${user.uid}`
            );

            await uploadBytes(storageRef, file);

            const downloadURL =
                await getDownloadURL(storageRef);

            await updateProfile(user, {
                photoURL: downloadURL,
            });

            await updateDoc(
                doc(db, "users", user.uid),
                {
                    photoURL: downloadURL,
                }
            );

            setProfile({
                ...profile,
                photoURL: downloadURL,
            });

            setPreviewImage(downloadURL);

            setMessage(
                "Foto de perfil actualizada correctamente."
            );

        } catch (error) {

            console.error(error);

            setMessage(
                "Error al subir la imagen."
            );

        }

        setUploading(false);

    };

    const handlePasswordChange = async () => {

        if (
            !passwords.currentPassword ||
            !passwords.newPassword ||
            !passwords.confirmPassword
        ) {

            setMessage(
                "Complete todos los campos de contraseña."
            );

            return;
        }

        if (
            passwords.newPassword !==
            passwords.confirmPassword
        ) {

            setMessage(
                "Las contraseñas no coinciden."
            );

            return;
        }

        if (
            passwords.newPassword.length < 6
        ) {

            setMessage(
                "La nueva contraseña debe contener al menos 8 caracteres."
            );

            return;
        }

        try {

            setChangingPassword(true);

            setMessage("");

            const user = auth.currentUser;

            const credential =
                EmailAuthProvider.credential(
                    user.email,
                    passwords.currentPassword
                );

            await reauthenticateWithCredential(
                user,
                credential
            );

            await updatePassword(
                user,
                passwords.newPassword
            );

            setPasswords({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            setMessage(
                "Contraseña actualizada correctamente."
            );

        } catch (error) {

            console.error(error);

            setMessage(
                "La contraseña actual es incorrecta."
            );

        }

        setChangingPassword(false);

    };

    if (loading) {

        return (

            <VolunteerLayout>

                <p>Loading profile...</p>

            </VolunteerLayout>

        );

    }

    return (

        <VolunteerLayout>

            <section className="dashboard-welcome">

                <h1>Mi Perfíl</h1>

                <p>
                    Consulta tu información personal.
                </p>

            </section>

            <section className="profile-card">

                <div className="profile-photo-container">

                    {profile.photoURL ? (

                        <img
                            src={
                                previewImage ||
                                profile.photoURL
                            }
                            alt="Profile"
                            className="profile-photo"
                        />

                    ) : (

                        <div className="profile-placeholder">

                            👤

                        </div>

                    )}

                    <label className="upload-photo-btn">

                        {
                            uploading
                                ? "Uploading..."
                                : "Cambiar Foto de Perfíl"
                        }

                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleImageChange}
                        />

                    </label>

                </div>

                <div className="profile-grid"></div>
                                        <div className="profile-field">

                        <label>Nombre Completo</label>

                        <input
                            type="text"
                            value={profile.nombre || ""}
                            onChange={(e) =>
                                setProfile({
                                    ...profile,
                                    nombre: e.target.value,
                                })
                            }
                        />

                    </div>

                    <div className="profile-field">

                        <label>Correo</label>

                        <input
                            type="email"
                            value={profile.email || ""}
                            disabled
                        />

                    </div>

                    <div className="profile-field">

                        <label>Celular</label>

                        <input
                            type="text"
                            value={profile.phone || ""}
                            onChange={(e) =>
                                setProfile({
                                    ...profile,
                                    phone: e.target.value,
                                })
                            }
                        />

                    </div>

                    <div className="profile-field">

                        <label>Distrito</label>

                        <input
                            type="text"
                            value={profile.distrito || ""}
                            onChange={(e) =>
                                setProfile({
                                    ...profile,
                                    distrito: e.target.value,
                                })
                            }
                        />

                    </div>

                    <div className="profile-field">

                        <label>Fecha de Nacimiento</label>

                        <input
                            type="date"
                            value={profile.fechaNacimiento || ""}
                            onChange={(e) =>
                                setProfile({
                                    ...profile,
                                    fechaNacimiento: e.target.value,
                                })
                            }
                        />

                    </div>

                    <div className="profile-field">

                        <label>Genero</label>

                        <select
                            value={profile.gender || ""}
                            onChange={(e) =>
                                setProfile({
                                    ...profile,
                                    gender: e.target.value,
                                })
                            }
                        >

                            <option value="">
                                Selecciona
                            </option>

                            <option value="Male">
                                Masculino
                            </option>

                            <option value="Female">
                                Femenino
                            </option>

                            <option value="Other">
                                Otros
                            </option>

                        </select>

                    </div>
                <div className="profile-actions">
                    {message && (
                        <p className="profile-message">
                            {message}
                        </p>
                    )}
                    <button
                        className="save-profile-btn"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {
                            saving
                                ? "Saving..."
                                : "Guardar Cambios"
                        }
                    </button>
                </div>
                <section className="change-password-card">
                    <h2>
                        Cambiar Contraseña
                    </h2>
                    <div className="profile-grid">
                        <div className="profile-field">
                            <label>
                                Contraseña actual
                            </label>
                            <input
                                type="password"
                                value={passwords.currentPassword}
                                onChange={(e) =>
                                    setPasswords({
                                        ...passwords,
                                        currentPassword:
                                            e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="profile-field">
                            <label>
                                Nueva contraseña
                            </label>
                            <input
                                type="password"
                                value={passwords.newPassword}
                                onChange={(e) =>
                                    setPasswords({
                                        ...passwords,
                                        newPassword:
                                            e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="profile-field">
                            <label>
                                Confirmar Contraseña
                            </label>
                            <input
                                type="password"
                                value={passwords.confirmPassword}
                                onChange={(e) =>
                                    setPasswords({
                                        ...passwords,
                                        confirmPassword:
                                            e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                    <button
                        className="save-profile-btn"
                        onClick={handlePasswordChange}
                        disabled={changingPassword}
                    >

                        {
                            changingPassword
                                ? "Updating..."
                                : "Actualizar Contraseña"
                        }
                    </button>
                </section>
                </section>
        </VolunteerLayout>

    );

}

export default VolunteerProfile;