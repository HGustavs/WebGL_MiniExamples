mat4.set=function(a,b){
		b[0]=a[0];
		b[1]=a[1];
		b[2]=a[2];
		b[3]=a[3];
		b[4]=a[4];
		b[5]=a[5];
		b[6]=a[6];
		b[7]=a[7];
		b[8]=a[8];
		b[9]=a[9];
		b[10]=a[10];
		b[11]=a[11];
		b[12]=a[12];
		b[13]=a[13];
		b[14]=a[14];
		b[15]=a[15];
		return b
};

mat4.identity=function(a){
		a[0]=1;
		a[1]=0;
		a[2]=0;
		a[3]=0;
		a[4]=0;
		a[5]=1;
		a[6]=0;
		a[7]=0;
		a[8]=0;
		a[9]=0;
		a[10]=1;
		a[11]=0;
		a[12]=0;
		a[13]=0;
		a[14]=0;
		a[15]=1;
		return a
};

mat4.inverse=function(a,b){
		b||(b=a);
		var c=a[0],
		d=a[1],
		e=a[2],
		g=a[3],
		f=a[4],
		h=a[5],
		i=a[6],
		j=a[7],
		k=a[8],
		l=a[9],
		o=a[10],
		m=a[11],
		n=a[12],
		p=a[13],
		r=a[14],
		s=a[15],
		A=c*h-d*f,
		B=c*i-e*f,
		t=c*j-g*f,
		u=d*i-e*h,
		v=d*j-g*h,
		w=e*j-g*i,
		x=k*p-l*n,
		y=k*r-o*n,
		z=k*s-m*n,
		C=l*r-o*p,
		D=l*s-m*p,
		E=o*s-m*r,
		q=1/(A*E-B*D+t*C+u*z-v*y+w*x);
		b[0]=(h*E-i*D+j*C)*q;
		b[1]=(-d*E+e*D-g*C)*q;
		b[2]=(p*w-r*v+s*u)*q;
		b[3]=(-l*w+o*v-m*u)*q;
		b[4]=(-f*E+i*z-j*y)*q;
		b[5]=(c*E-e*z+g*y)*q;
		b[6]=(-n*w+r*t-s*B)*q;
		b[7]=(k*w-o*t+m*B)*q;
		b[8]=(f*D-h*z+j*x)*q;
		b[9]=(-c*D+d*z-g*x)*q;
		b[10]=(n*v-p*t+s*A)*q;
		b[11]=(-k*v+l*t-m*A)*q;
		b[12]=(-f*C+h*y-i*x)*q;
		b[13]=(c*C-d*y+e*x)*q;
		b[14]=(-n*u+p*B-r*A)*q;
		b[15]=(k*u-l*B+o*A)*q;
		return b
};

mat4.create=function(a){
		var b=new glMatrixArrayType(16);
		if(a){
			b[0]=a[0];
			b[1]=a[1];
			b[2]=a[2];
			b[3]=a[3];
			b[4]=a[4];
			b[5]=a[5];
			b[6]=a[6];
			b[7]=a[7];
			b[8]=a[8];
			b[9]=a[9];
			b[10]=a[10];
			b[11]=a[11];
			b[12]=a[12];
			b[13]=a[13];
			b[14]=a[14];
			b[15]=a[15]
	}
	return b;
};