import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { contactApi, analyticsApi } from '../../api/client';
import type { ContactSubmission, FormState } from '../../types';

export default function ContactForm() {
  const [searchParams] = useSearchParams();
  const projectFromUrl = searchParams.get('project');

  const [formData, setFormData] = useState<ContactSubmission>({
    name: '',
    email: '',
    country_code: '',
    phone_number: '',
    contact_method: 'email',
    online_consultation: false,
    consultation_date: '',
    consultation_time: '',
    message: projectFromUrl 
      ? `Hi! I'm interested in learning more about the "${projectFromUrl}" project. `
      : '',
    consent: false,
  });

  const [formState, setFormState] = useState<FormState>({
    isSubmitting: false,
    isSuccess: false,
    isError: false,
    message: null,
  });

  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  // Fetch available times when date changes
  useEffect(() => {
    if (formData.consultation_date) {
      contactApi.getAvailableTimes(formData.consultation_date)
        .then(setAvailableTimes)
        .catch(() => setAvailableTimes([]));
    }
  }, [formData.consultation_date]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setFormState({
      isSubmitting: true,
      isSuccess: false,
      isError: false,
      message: null,
    });

    try {
      const response = await contactApi.submit(formData);
      
      if (response.success) {
        setFormState({
          isSubmitting: false,
          isSuccess: true,
          isError: false,
          message: 'Thank you! Your message has been sent successfully. We\'ll get back to you soon.',
        });
        
        // Track successful submission
        analyticsApi.trackFormSubmission('contact_form', true);
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          country_code: '',
          phone_number: '',
          contact_method: 'email',
          online_consultation: false,
          consultation_date: '',
          consultation_time: '',
          message: '',
          consent: false,
        });
      } else {
        throw new Error(response.message || 'Something went wrong');
      }
    } catch (error) {
      setFormState({
        isSubmitting: false,
        isSuccess: false,
        isError: true,
        message: error instanceof Error ? error.message : 'Failed to send message. Please try again.',
      });
      
      // Track failed submission
      analyticsApi.trackFormSubmission('contact_form', false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="contact-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Status Message */}
      {formState.message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg flex items-start gap-3 ${
            formState.isSuccess 
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {formState.isSuccess ? (
            <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          )}
          <p>{formState.message}</p>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-black dark:text-gray-300 mb-2">
            Your Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
            className="form-input"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-black dark:text-gray-300 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            className="form-input"
          />
        </div>

        {/* Country Code */}
        <div>
          <label htmlFor="country_code" className="block text-sm font-medium text-black dark:text-gray-300 mb-2">
            Country Code
          </label>
          <select
            id="country_code"
            name="country_code"
            value={formData.country_code}
            onChange={handleChange}
            className="form-select"
          >
            <option value="">Select country</option>
            <option value="+93">🇦🇫 Afghanistan (+93)</option>
            <option value="+355">🇦🇱 Albania (+355)</option>
            <option value="+213">🇩🇿 Algeria (+213)</option>
            <option value="+376">🇦🇩 Andorra (+376)</option>
            <option value="+244">🇦🇴 Angola (+244)</option>
            <option value="+1264">🇦🇮 Anguilla (+1264)</option>
            <option value="+1268">🇦🇬 Antigua & Barbuda (+1268)</option>
            <option value="+54">🇦🇷 Argentina (+54)</option>
            <option value="+374">🇦🇲 Armenia (+374)</option>
            <option value="+297">🇦🇼 Aruba (+297)</option>
            <option value="+61">🇦🇺 Australia (+61)</option>
            <option value="+43">🇦🇹 Austria (+43)</option>
            <option value="+994">🇦🇿 Azerbaijan (+994)</option>
            <option value="+1242">🇧🇸 Bahamas (+1242)</option>
            <option value="+973">🇧🇭 Bahrain (+973)</option>
            <option value="+880">🇧🇩 Bangladesh (+880)</option>
            <option value="+1246">🇧🇧 Barbados (+1246)</option>
            <option value="+375">🇧🇾 Belarus (+375)</option>
            <option value="+32">🇧🇪 Belgium (+32)</option>
            <option value="+501">🇧🇿 Belize (+501)</option>
            <option value="+229">🇧🇯 Benin (+229)</option>
            <option value="+1441">🇧🇲 Bermuda (+1441)</option>
            <option value="+975">🇧🇹 Bhutan (+975)</option>
            <option value="+591">🇧🇴 Bolivia (+591)</option>
            <option value="+387">🇧🇦 Bosnia Herzegovina (+387)</option>
            <option value="+267">🇧🇼 Botswana (+267)</option>
            <option value="+55">🇧🇷 Brazil (+55)</option>
            <option value="+673">🇧🇳 Brunei (+673)</option>
            <option value="+359">🇧🇬 Bulgaria (+359)</option>
            <option value="+226">🇧🇫 Burkina Faso (+226)</option>
            <option value="+257">🇧🇮 Burundi (+257)</option>
            <option value="+855">🇰🇭 Cambodia (+855)</option>
            <option value="+237">🇨🇲 Cameroon (+237)</option>
            <option value="+1">🇨🇦 Canada (+1)</option>
            <option value="+238">🇨🇻 Cape Verde Islands (+238)</option>
            <option value="+1345">🇰🇾 Cayman Islands (+1345)</option>
            <option value="+236">🇨🇫 Central African Republic (+236)</option>
            <option value="+235">🇹🇩 Chad (+235)</option>
            <option value="+56">🇨🇱 Chile (+56)</option>
            <option value="+86">🇨🇳 China (+86)</option>
            <option value="+57">🇨🇴 Colombia (+57)</option>
            <option value="+269">🇰🇲 Comoros (+269)</option>
            <option value="+242">🇨🇬 Congo (+242)</option>
            <option value="+682">🇨🇰 Cook Islands (+682)</option>
            <option value="+506">🇨🇷 Costa Rica (+506)</option>
            <option value="+385">🇭🇷 Croatia (+385)</option>
            <option value="+53">🇨🇺 Cuba (+53)</option>
            <option value="+90392">🇨🇾 Cyprus North (+90392)</option>
            <option value="+357">🇨🇾 Cyprus South (+357)</option>
            <option value="+420">🇨🇿 Czech Republic (+420)</option>
            <option value="+45">🇩🇰 Denmark (+45)</option>
            <option value="+253">🇩🇯 Djibouti (+253)</option>
            <option value="+1809">🇩🇲 Dominica (+1809)</option>
            <option value="+1809">🇩🇴 Dominican Republic (+1809)</option>
            <option value="+593">🇪🇨 Ecuador (+593)</option>
            <option value="+20">🇪🇬 Egypt (+20)</option>
            <option value="+503">🇸🇻 El Salvador (+503)</option>
            <option value="+240">🇬🇶 Equatorial Guinea (+240)</option>
            <option value="+291">🇪🇷 Eritrea (+291)</option>
            <option value="+372">🇪🇪 Estonia (+372)</option>
            <option value="+251">🇪🇹 Ethiopia (+251)</option>
            <option value="+500">🇫🇰 Falkland Islands (+500)</option>
            <option value="+298">🇫🇴 Faroe Islands (+298)</option>
            <option value="+679">🇫🇯 Fiji (+679)</option>
            <option value="+358">🇫🇮 Finland (+358)</option>
            <option value="+33">🇫🇷 France (+33)</option>
            <option value="+594">🇬🇫 French Guiana (+594)</option>
            <option value="+689">🇵🇫 French Polynesia (+689)</option>
            <option value="+241">🇬🇦 Gabon (+241)</option>
            <option value="+220">🇬🇲 Gambia (+220)</option>
            <option value="+995">🇬🇪 Georgia (+995)</option>
            <option value="+49">🇩🇪 Germany (+49)</option>
            <option value="+233">🇬🇭 Ghana (+233)</option>
            <option value="+350">🇬🇮 Gibraltar (+350)</option>
            <option value="+30">🇬🇷 Greece (+30)</option>
            <option value="+299">🇬🇱 Greenland (+299)</option>
            <option value="+1473">🇬🇩 Grenada (+1473)</option>
            <option value="+590">🇬🇵 Guadeloupe (+590)</option>
            <option value="+671">🇬🇺 Guam (+671)</option>
            <option value="+502">🇬🇹 Guatemala (+502)</option>
            <option value="+224">🇬🇳 Guinea (+224)</option>
            <option value="+245">🇬🇼 Guinea - Bissau (+245)</option>
            <option value="+592">🇬🇾 Guyana (+592)</option>
            <option value="+509">🇭🇹 Haiti (+509)</option>
            <option value="+504">🇭🇳 Honduras (+504)</option>
            <option value="+852">🇭🇰 Hong Kong (+852)</option>
            <option value="+36">🇭🇺 Hungary (+36)</option>
            <option value="+354">🇮🇸 Iceland (+354)</option>
            <option value="+91">🇮🇳 India (+91)</option>
            <option value="+62">🇮🇩 Indonesia (+62)</option>
            <option value="+98">🇮🇷 Iran (+98)</option>
            <option value="+964">🇮🇶 Iraq (+964)</option>
            <option value="+353">🇮🇪 Ireland (+353)</option>
            <option value="+972">🇮🇱 Israel (+972)</option>
            <option value="+39">🇮🇹 Italy (+39)</option>
            <option value="+1876">🇯🇲 Jamaica (+1876)</option>
            <option value="+81">🇯🇵 Japan (+81)</option>
            <option value="+962">🇯🇴 Jordan (+962)</option>
            <option value="+7">🇰🇿 Kazakhstan (+7)</option>
            <option value="+254">🇰🇪 Kenya (+254)</option>
            <option value="+686">🇰🇮 Kiribati (+686)</option>
            <option value="+850">🇰🇵 Korea North (+850)</option>
            <option value="+82">🇰🇷 Korea South (+82)</option>
            <option value="+965">🇰🇼 Kuwait (+965)</option>
            <option value="+996">🇰🇬 Kyrgyzstan (+996)</option>
            <option value="+856">🇱🇦 Laos (+856)</option>
            <option value="+371">🇱🇻 Latvia (+371)</option>
            <option value="+961">🇱🇧 Lebanon (+961)</option>
            <option value="+266">🇱🇸 Lesotho (+266)</option>
            <option value="+231">🇱🇷 Liberia (+231)</option>
            <option value="+218">🇱🇾 Libya (+218)</option>
            <option value="+417">🇱🇮 Liechtenstein (+417)</option>
            <option value="+370">🇱🇹 Lithuania (+370)</option>
            <option value="+352">🇱🇺 Luxembourg (+352)</option>
            <option value="+853">🇲🇴 Macao (+853)</option>
            <option value="+389">🇲🇰 Macedonia (+389)</option>
            <option value="+261">🇲🇬 Madagascar (+261)</option>
            <option value="+265">🇲🇼 Malawi (+265)</option>
            <option value="+60">🇲🇾 Malaysia (+60)</option>
            <option value="+960">🇲🇻 Maldives (+960)</option>
            <option value="+223">🇲🇱 Mali (+223)</option>
            <option value="+356">🇲🇹 Malta (+356)</option>
            <option value="+692">🇲🇭 Marshall Islands (+692)</option>
            <option value="+596">🇲🇶 Martinique (+596)</option>
            <option value="+222">🇲🇷 Mauritania (+222)</option>
            <option value="+269">🇾🇹 Mayotte (+269)</option>
            <option value="+52">🇲🇽 Mexico (+52)</option>
            <option value="+691">🇫🇲 Micronesia (+691)</option>
            <option value="+373">🇲🇩 Moldova (+373)</option>
            <option value="+377">🇲🇨 Monaco (+377)</option>
            <option value="+976">🇲🇳 Mongolia (+976)</option>
            <option value="+1664">🇲🇸 Montserrat (+1664)</option>
            <option value="+212">🇲🇦 Morocco (+212)</option>
            <option value="+258">🇲🇿 Mozambique (+258)</option>
            <option value="+95">🇲🇲 Myanmar (+95)</option>
            <option value="+264">🇳🇦 Namibia (+264)</option>
            <option value="+674">🇳🇷 Nauru (+674)</option>
            <option value="+977">🇳🇵 Nepal (+977)</option>
            <option value="+31">🇳🇱 Netherlands (+31)</option>
            <option value="+687">🇳🇨 New Caledonia (+687)</option>
            <option value="+64">🇳🇿 New Zealand (+64)</option>
            <option value="+505">🇳🇮 Nicaragua (+505)</option>
            <option value="+227">🇳🇪 Niger (+227)</option>
            <option value="+234">🇳🇬 Nigeria (+234)</option>
            <option value="+683">🇳🇺 Niue (+683)</option>
            <option value="+672">🇳🇫 Norfolk Islands (+672)</option>
            <option value="+670">🇲🇵 Northern Marianas (+670)</option>
            <option value="+47">🇳🇴 Norway (+47)</option>
            <option value="+968">🇴🇲 Oman (+968)</option>
            <option value="+92">🇵🇰 Pakistan (+92)</option>
            <option value="+680">🇵🇼 Palau (+680)</option>
            <option value="+507">🇵🇦 Panama (+507)</option>
            <option value="+675">🇵🇬 Papua New Guinea (+675)</option>
            <option value="+595">🇵🇾 Paraguay (+595)</option>
            <option value="+51">🇵🇪 Peru (+51)</option>
            <option value="+63">🇵🇭 Philippines (+63)</option>
            <option value="+48">🇵🇱 Poland (+48)</option>
            <option value="+351">🇵🇹 Portugal (+351)</option>
            <option value="+1787">🇵🇷 Puerto Rico (+1787)</option>
            <option value="+974">🇶🇦 Qatar (+974)</option>
            <option value="+262">🇷🇪 Reunion (+262)</option>
            <option value="+40">🇷🇴 Romania (+40)</option>
            <option value="+7">🇷🇺 Russia (+7)</option>
            <option value="+250">🇷🇼 Rwanda (+250)</option>
            <option value="+378">🇸🇲 San Marino (+378)</option>
            <option value="+239">🇸🇹 Sao Tome & Principe (+239)</option>
            <option value="+966">🇸🇦 Saudi Arabia (+966)</option>
            <option value="+221">🇸🇳 Senegal (+221)</option>
            <option value="+381">🇷🇸 Serbia (+381)</option>
            <option value="+248">🇸🇨 Seychelles (+248)</option>
            <option value="+232">🇸🇱 Sierra Leone (+232)</option>
            <option value="+65">🇸🇬 Singapore (+65)</option>
            <option value="+421">🇸🇰 Slovak Republic (+421)</option>
            <option value="+386">🇸🇮 Slovenia (+386)</option>
            <option value="+677">🇸🇧 Solomon Islands (+677)</option>
            <option value="+252">🇸🇴 Somalia (+252)</option>
            <option value="+27">🇿🇦 South Africa (+27)</option>
            <option value="+34">🇪🇸 Spain (+34)</option>
            <option value="+94">🇱🇰 Sri Lanka (+94)</option>
            <option value="+290">🇸🇭 St. Helena (+290)</option>
            <option value="+1869">🇰🇳 St. Kitts (+1869)</option>
            <option value="+1758">🇱🇨 St. Lucia (+1758)</option>
            <option value="+249">🇸🇩 Sudan (+249)</option>
            <option value="+597">🇸🇷 Suriname (+597)</option>
            <option value="+268">🇸🇿 Swaziland (+268)</option>
            <option value="+41">🇨🇭 Switzerland (+41)</option>
            <option value="+963">🇸🇾 Syria (+963)</option>
            <option value="+886">🇹🇼 Taiwan (+886)</option>
            <option value="+7">🇹🇯 Tajikistan (+7)</option>
            <option value="+66">🇹🇭 Thailand (+66)</option>
            <option value="+228">🇹🇬 Togo (+228)</option>
            <option value="+676">🇹🇴 Tonga (+676)</option>
            <option value="+1868">🇹🇹 Trinidad & Tobago (+1868)</option>
            <option value="+216">🇹🇳 Tunisia (+216)</option>
            <option value="+90">🇹🇷 Turkey (+90)</option>
            <option value="+993">🇹🇲 Turkmenistan (+993)</option>
            <option value="+1649">🇹🇨 Turks & Caicos Islands (+1649)</option>
            <option value="+688">🇹🇻 Tuvalu (+688)</option>
            <option value="+256">🇺🇬 Uganda (+256)</option>
            <option value="+44">🇬🇧 UK (+44)</option>
            <option value="+380">🇺🇦 Ukraine (+380)</option>
            <option value="+971">🇦🇪 UAE (+971)</option>
            <option value="+598">🇺🇾 Uruguay (+598)</option>
            <option value="+1">🇺🇸 USA (+1)</option>
            <option value="+7">🇺🇿 Uzbekistan (+7)</option>
            <option value="+678">🇻🇺 Vanuatu (+678)</option>
            <option value="+379">🇻🇦 Vatican City (+379)</option>
            <option value="+58">🇻🇪 Venezuela (+58)</option>
            <option value="+84">🇻🇳 Vietnam (+84)</option>
            <option value="+1284">🇻🇬 Virgin Islands - British (+1284)</option>
            <option value="+1340">🇻🇮 Virgin Islands - US (+1340)</option>
            <option value="+681">🇼🇫 Wallis & Futuna (+681)</option>
            <option value="+969">🇾🇪 Yemen (North)(+969)</option>
            <option value="+967">🇾🇪 Yemen (South)(+967)</option>
            <option value="+260">🇿🇲 Zambia (+260)</option>
            <option value="+263">🇿🇼 Zimbabwe (+263)</option>
          </select>
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-black dark:text-gray-300 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            placeholder="Enter your phone number"
            className="form-input"
          />
        </div>

        {/* Contact Method */}
        <div className="md:col-span-2">
          <label htmlFor="contact_method" className="block text-sm font-medium text-black dark:text-gray-300 mb-2">
            Preferred Contact Method *
          </label>
          <select
            id="contact_method"
            name="contact_method"
            value={formData.contact_method}
            onChange={handleChange}
            required
            className="form-select"
          >
            <option value="">Select method</option>
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-black dark:text-gray-300 mb-2">
          Project Details *
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Tell us about your project, timeline, and any specific requirements..."
          required
          rows={6}
          className="form-textarea"
        />
      </div>

      {/* Consultation Checkbox */}
      <div className="contact-checkbox-group">
        <label className="contact-checkbox-label">
          <input
            type="checkbox"
            name="online_consultation"
            checked={formData.online_consultation}
            onChange={handleChange}
            className="form-checkbox"
          />
          <span className="contact-checkbox-text text-black dark:text-gray-200">Would you like to book an online consultation?</span>
        </label>
      </div>

      {/* Consultation Fields */}
      {formData.online_consultation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="grid md:grid-cols-2 gap-6"
        >
          <div>
            <label htmlFor="consultation_date" className="block text-sm font-medium text-black dark:text-gray-300 mb-2">
              Preferred Date
            </label>
            <input
              type="date"
              id="consultation_date"
              name="consultation_date"
              value={formData.consultation_date}
              onChange={handleChange}
              min={today}
              className="form-input"
            />
          </div>

          <div>
            <label htmlFor="consultation_time" className="block text-sm font-medium text-black dark:text-gray-300 mb-2">
              Preferred Time
            </label>
            <select
              id="consultation_time"
              name="consultation_time"
              value={formData.consultation_time}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Select time</option>
              {(availableTimes.length > 0 ? availableTimes : [
                '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
              ]).map((time) => (
                <option key={time} value={time}>
                  {time.split(':')[0] >= '12' 
                    ? `${parseInt(time.split(':')[0]) - 12 || 12}:${time.split(':')[1]} PM`
                    : `${parseInt(time.split(':')[0])}:${time.split(':')[1]} AM`
                  }
                </option>
              ))}
            </select>
          </div>
        </motion.div>
      )}

      {/* Consent */}
      <div className="contact-checkbox-group">
        <label className="contact-checkbox-label">
          <input
            type="checkbox"
            name="consent"
            checked={formData.consent}
            onChange={handleChange}
            required
            className="form-checkbox"
          />
          <span className="contact-checkbox-text text-black dark:text-gray-200">
            I consent to be contacted regarding my project inquiry *
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={formState.isSubmitting}
        className="cta-button w-full justify-center"
      >
        {formState.isSubmitting ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send size={20} />
            Send Message
          </>
        )}
      </button>
    </motion.form>
  );
}
