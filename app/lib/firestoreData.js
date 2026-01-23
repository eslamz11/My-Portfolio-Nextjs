import { collection, doc, getDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

/**
 * جلب البيانات الشخصية
 */
export async function getPersonalData() {
  try {
    const docRef = doc(db, 'portfolio', 'personalData');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.warn('No personal data found in Firestore');
      // إرجاع البيانات الافتراضية من الملف المحلي
      const { personalData } = await import('@/utils/data/personal-data');
      return personalData;
    }
  } catch (error) {
    console.error('Error fetching personal data:', error);
    // في حالة الخطأ، إرجاع البيانات المحلية
    const { personalData } = await import('@/utils/data/personal-data');
    return personalData;
  }
}

/**
 * جلب جميع المشاريع
 */
export async function getAllProjects() {
  try {
    const projectsRef = collection(db, 'projects');
    // جلب جميع الوثائق أولاً لتجنب استثناء الوثائق التي تفتقر لحقل 'order'
    const querySnapshot = await getDocs(projectsRef);

    const projects = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      projects.push({
        id: data.id || doc.id,
        name: data.name,
        name_ar: data.name_ar || '',
        description: data.description,
        description_ar: data.description_ar || '',
        tools: data.tools || [],
        role: data.role,
        role_ar: data.role_ar || '',
        code: data.code || '',
        demo: data.demo || '',
        downloadLink: data.downloadLink || '',
        image: data.image || '/image/placeholder.png',
        project_images: data.project_images || [],
        videos: data.videos || [],
        order: parseInt(data.order) || 0,
        featured: data.featured !== undefined ? (data.featured === true || data.featured === 'true') : true,
        type: data.type || 'regular'
      });
    });

    // ترتيب المشاريع في الذاكرة
    projects.sort((a, b) => a.order - b.order);

    if (projects.length > 0) {
      return projects;
    } else {
      console.warn('No projects found in Firestore');
      // إرجاع المشاريع الافتراضية
      const { projectsData } = await import('@/utils/data/projects-data');
      return projectsData;
    }
  } catch (error) {
    console.error('Error fetching projects:', error);
    // في حالة الخطأ، إرجاع البيانات المحلية
    const { projectsData } = await import('@/utils/data/projects-data');
    return projectsData;
  }
}

/**
 * جلب المشاريع المميزة للصفحة الرئيسية
 */
export async function getFeaturedProjects(limitCount = 6) {
  try {
    const projectsRef = collection(db, 'projects');
    // جلب جميع المشاريع وتصفيتها في الذاكرة لتجنب الحاجة إلى فهارس مركبة (composite indexes)
    const querySnapshot = await getDocs(projectsRef);

    const projects = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      projects.push({
        id: data.id || doc.id,
        name: data.name,
        name_ar: data.name_ar || '',
        description: data.description,
        description_ar: data.description_ar || '',
        tools: data.tools || [],
        role: data.role,
        role_ar: data.role_ar || '',
        code: data.code || '',
        demo: data.demo || '',
        downloadLink: data.downloadLink || '',
        image: data.image || '/image/placeholder.png',
        project_images: data.project_images || [],
        videos: data.videos || [],
        order: parseInt(data.order) || 0,
        featured: data.featured !== undefined ? (data.featured === true || data.featured === 'true') : true,
        type: data.type || 'regular'
      });
    });

    // تصفية المشاريع المميزة، ترتيبها، وتحديد العدد المطلوب
    const featuredProjects = projects
      .filter(p => p.featured === true)
      .sort((a, b) => a.order - b.order)
      .slice(0, limitCount);

    if (featuredProjects.length > 0) {
      return featuredProjects;
    } else {
      console.warn('No featured projects found in Firestore');
      // إرجاع المشاريع الافتراضية
      const { projectsData } = await import('@/utils/data/projects-data');
      return projectsData.slice(0, limitCount);
    }
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    // في حالة الخطأ، إرجاع البيانات المحلية
    const { projectsData } = await import('@/utils/data/projects-data');
    return projectsData.slice(0, limitCount);
  }
}

/**
 * جلب مشروع واحد حسب ID
 */
export async function getProjectById(id) {
  try {
    const projects = await getAllProjects();
    // البحث عن المشروع مع دعم الـ IDs الرقمية والنصية
    return projects.find(p =>
      p.id?.toString() === id?.toString() ||
      parseInt(p.id) === parseInt(id)
    );
  } catch (error) {
    console.error('Error fetching project by ID:', error);
    return null;
  }
}

/**
 * جلب المهارات
 */
export async function getAllSkills() {
  try {
    const docRef = doc(db, 'portfolio', 'skills');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().skills || [];
    } else {
      console.warn('No skills found in Firestore');
      // إرجاع المهارات الافتراضية
      const { skills } = await import('@/utils/data/skills');
      return skills;
    }
  } catch (error) {
    console.error('Error fetching skills:', error);
    // في حالة الخطأ، إرجاع البيانات المحلية
    const { skills } = await import('@/utils/data/skills');
    return skills;
  }
}

/**
 * جلب الخبرات
 */
export async function getAllExperience() {
  try {
    const experiencesRef = collection(db, 'experience');
    const q = query(experiencesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const experiences = [];
    querySnapshot.forEach((doc) => {
      experiences.push({ docId: doc.id, ...doc.data() });
    });

    if (experiences.length > 0) {
      return experiences;
    } else {
      console.warn('No experience found in Firestore');
      // إرجاع الخبرات الافتراضية
      const { experiences: defaultExperiences } = await import('@/utils/data/experience');
      return defaultExperiences;
    }
  } catch (error) {
    console.error('Error fetching experience:', error);
    // في حالة الخطأ، إرجاع البيانات المحلية
    const { experiences } = await import('@/utils/data/experience');
    return experiences;
  }
}

/**
 * جلب التعليم
 */
export async function getAllEducation() {
  try {
    const educationRef = collection(db, 'education');
    const q = query(educationRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const educations = [];
    querySnapshot.forEach((doc) => {
      educations.push({ docId: doc.id, ...doc.data() });
    });

    if (educations.length > 0) {
      return educations;
    } else {
      console.warn('No education found in Firestore');
      // إرجاع التعليم الافتراضي
      const { educations: defaultEducations } = await import('@/utils/data/educations');
      return defaultEducations;
    }
  } catch (error) {
    console.error('Error fetching education:', error);
    // في حالة الخطأ، إرجاع البيانات المحلية
    const { educations } = await import('@/utils/data/educations');
    return educations;
  }
}


export default {
  getPersonalData,
  getAllProjects,
  getProjectById,
  getAllSkills,
  getAllExperience,
  getAllEducation
};

