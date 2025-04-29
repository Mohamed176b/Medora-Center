import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { showToast } from "../../../redux/slices/toastSlice";
import { supabase } from "../../../supabase/supabaseClient";
import { updateSiteSettings } from "../../../redux/slices/adminSlice";
import ButtonLoader from "./ButtonLoader";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const LocationPicker = React.memo(({ position, setPosition }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const handlePositionUpdate = debounce((newPos) => {
    if (!isUpdating) {
      setIsUpdating(true);
      try {
        setPosition(newPos);
      } catch (error) {
        // console.error("Error updating position:", error);
      } finally {
        setIsUpdating(false);
      }
    }
  }, 100);

  const map = useMapEvents({
    click(e) {
      try {
        if (!isUpdating && mapRef.current) {
          const newPos = [e.latlng.lat, e.latlng.lng];
          handlePositionUpdate(newPos);
        }
      } catch (error) {
        // console.error("Error handling map click:", error);
      }
    },
  });

  useEffect(() => {
    if (position && map) {
      mapRef.current = map;
      try {
        requestAnimationFrame(() => {
          if (mapRef.current && !isUpdating) {
            mapRef.current.setView(position, mapRef.current.getZoom());
          }
        });
      } catch (error) {
        // console.error("Error updating map view:", error);
      }
    }
  }, [position, map, isUpdating]);

  return position && !isUpdating ? (
    <Marker
      position={position}
      ref={markerRef}
      eventHandlers={{
        dragend: () => {
          try {
            const marker = markerRef.current;
            if (marker && !isUpdating) {
              const newPos = marker.getLatLng();
              handlePositionUpdate([newPos.lat, newPos.lng]);
            }
          } catch (error) {
            // console.error("Error handling marker drag:", error);
          }
        },
      }}
      draggable={true}
    />
  ) : null;
});

const ContactSettings = React.memo(({ canEdit, contactData, dispatch }) => {
  const [saving, setSaving] = useState(false);
  const [localContactData, setLocalContactData] = useState(
    contactData || {
      phone: "",
      facebook_url: "",
      instagram_url: "",
      x_url: "",
      threads_url: "",
      latitude: 31.9539,
      longitude: 35.9106,
      email: "",
      address: "",
      working_hours: "",
    }
  );

  const defaultPosition = [31.9539, 35.9106];
  const [position, setPosition] = useState([
    parseFloat(localContactData.latitude) || defaultPosition[0],
    parseFloat(localContactData.longitude) || defaultPosition[1],
  ]);
  const [mapKey] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalContactData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePositionChange = (newPosition) => {
    setPosition(newPosition);
    setLocalContactData((prev) => ({
      ...prev,
      latitude: newPosition[0],
      longitude: newPosition[1],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from("site_contact")
        .upsert([localContactData], {
          onConflict: "id",
          defaultToNull: false,
        });

      if (error) throw error;

      dispatch(updateSiteSettings({ page: "contact", data: localContactData }));

      dispatch(
        showToast({
          message: "تم حفظ معلومات التواصل بنجاح",
          type: "success",
        })
      );
    } catch (error) {
      console.error("Error saving contact data:", error);
      dispatch(
        showToast({
          message: "خطأ في حفظ معلومات التواصل",
          type: "error",
        })
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="site-settings-form">
      <div className="form-group">
        <label>رقم الهاتف</label>
        <input
          type="text"
          name="phone"
          value={localContactData.phone || ""}
          onChange={handleChange}
          disabled={!canEdit}
          dir="ltr"
        />
      </div>

      <div className="form-group">
        <label>رابط فيسبوك</label>
        <input
          type="text"
          name="facebook_url"
          value={localContactData.facebook_url || ""}
          onChange={handleChange}
          disabled={!canEdit}
          dir="ltr"
        />
      </div>

      <div className="form-group">
        <label>رابط إنستغرام</label>
        <input
          type="text"
          name="instagram_url"
          value={localContactData.instagram_url || ""}
          onChange={handleChange}
          disabled={!canEdit}
          dir="ltr"
        />
      </div>

      <div className="form-group">
        <label>رابط X (تويتر سابقاً)</label>
        <input
          type="text"
          name="x_url"
          value={localContactData.x_url || ""}
          onChange={handleChange}
          disabled={!canEdit}
          dir="ltr"
        />
      </div>

      <div className="form-group">
        <label>رابط ثريدس</label>
        <input
          type="text"
          name="threads_url"
          value={localContactData.threads_url || ""}
          onChange={handleChange}
          disabled={!canEdit}
          dir="ltr"
        />
      </div>

      <div className="form-group">
        <label>الايميل</label>
        <input
          type="email"
          name="email"
          value={localContactData.email || ""}
          onChange={handleChange}
          disabled={!canEdit}
          dir="ltr"
        />
      </div>

      <div className="form-group">
        <label>مواعيد العمل</label>
        <input
          type="text"
          name="working_hours"
          value={localContactData.working_hours || ""}
          onChange={handleChange}
          disabled={!canEdit}
        />
      </div>

      <div className="form-group">
        <label>العنوان</label>
        <input
          type="text"
          name="address"
          value={localContactData.address || ""}
          onChange={handleChange}
          disabled={!canEdit}
        />
      </div>

      <div className="form-group">
        <label>موقع المركز</label>
        <div className="map-container">
          {position && (
            <MapContainer
              key={mapKey}
              center={position}
              zoom={13}
              style={{ height: "400px", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationPicker
                position={position}
                setPosition={handlePositionChange}
              />
            </MapContainer>
          )}
          {canEdit && position && (
            <div className="map-coordinates">
              <p>خط العرض: {position[0].toFixed(6)}</p>
              <p>خط الطول: {position[1].toFixed(6)}</p>
            </div>
          )}
        </div>
      </div>

      {canEdit && (
        <div className="form-actions">
          <button type="submit" className="save-button" disabled={saving}>
            {saving ? (
              <ButtonLoader />
            ) : (
              <>
                <i className="fas fa-save"></i>
                حفظ معلومات التواصل
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
});

export default ContactSettings;

